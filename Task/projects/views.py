from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import Project
from .serializers import ProjectSerializer, ProjectListSerializer
from accounts.permissions import IsClient, IsFreelancer, IsNotBanned


def _check_and_log_profanity(user, text, context_id=None):
    """Run profanity scan on text and log a ProfanityReport if detected."""
    from reports.profanity import scan_for_profanity
    from reports.models import ProfanityReport

    has_profanity, found_words = scan_for_profanity(text or '')
    if has_profanity:
        ProfanityReport.objects.create(
            user=user,
            content_type=ProfanityReport.ContentType.PROJECT,
            content_snippet=text[:500],
            detected_words=found_words,
            context_id=context_id,
        )
    return has_profanity, found_words


class ProjectFilter(django_filters.FilterSet):
    """Filters for project discovery."""

    min_budget = django_filters.NumberFilter(field_name='budget', lookup_expr='gte')
    max_budget = django_filters.NumberFilter(field_name='budget', lookup_expr='lte')
    deadline_before = django_filters.DateFilter(field_name='deadline', lookup_expr='lte')
    deadline_after = django_filters.DateFilter(field_name='deadline', lookup_expr='gte')
    skill = django_filters.CharFilter(method='filter_by_skill')
    is_verified = django_filters.BooleanFilter(field_name='is_verified')

    class Meta:
        model = Project
        fields = ['status', 'is_verified']

    def filter_by_skill(self, queryset, name, value):
        """Filter projects that require a given skill (case-insensitive)."""
        return queryset.filter(required_skills__icontains=value)


class ProjectCreateView(generics.CreateAPIView):
    """Clients create new projects. POST /api/projects/create/"""

    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def perform_create(self, serializer):
        project = serializer.save()
        # Scan title + description for profanity
        combined = f"{project.title} {project.description}"
        _check_and_log_profanity(self.request.user, combined, context_id=project.id)


class ProjectListView(generics.ListAPIView):
    """
    List all open projects with filtering.
    GET /api/projects/
    Freelancers discover projects here.
    """

    serializer_class = ProjectListSerializer
    permission_classes = [permissions.IsAuthenticated, IsNotBanned]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProjectFilter
    search_fields = ['title', 'description']
    ordering_fields = ['budget', 'deadline', 'created_at', 'total_bids']
    ordering = ['-created_at']

    def get_queryset(self):
        return Project.objects.filter(status=Project.Status.OPEN).select_related('client')


class ProjectDetailView(generics.RetrieveAPIView):
    """View single project detail."""

    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Project.objects.select_related('client').all()


class MyProjectsView(generics.ListAPIView):
    """Client views their own projects. GET /api/projects/my/"""

    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def get_queryset(self):
        return Project.objects.filter(client=self.request.user).select_related('client')


class ProjectUpdateView(generics.UpdateAPIView):
    """Client updates their project."""

    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]
    http_method_names = ['patch']

    def get_queryset(self):
        return Project.objects.filter(client=self.request.user)

    def perform_update(self, serializer):
        project = serializer.save()
        # Re-scan if description changed
        combined = f"{project.title} {project.description}"
        _check_and_log_profanity(self.request.user, combined, context_id=project.id)


class RecommendedProjectsView(generics.ListAPIView):
    """
    List open projects computationally sorted by overlap with freelancer's skills.
    GET /api/projects/recommended/
    """
    serializer_class = ProjectListSerializer
    permission_classes = [permissions.IsAuthenticated, IsFreelancer, IsNotBanned]

    def list(self, request, *args, **kwargs):
        user = request.user
        try:
            profile = user.freelancer_profile
            # Handle both empty list and None cases
            my_skills = [s.lower().strip() for s in (profile.skills or []) if s]
        except Exception:
            my_skills = []

        projects = Project.objects.filter(status=Project.Status.OPEN).select_related('client')
        
        if not my_skills:
            # If no skills set, just return latest projects
            serializer = self.get_serializer(projects[:20], many=True)
            return Response(serializer.data)

        scored_projects = []
        for p in projects:
            req_skills_raw = p.required_skills or []
            if isinstance(req_skills_raw, str):
                req_skills_raw = [s.strip() for s in req_skills_raw.split(',')]
            
            req_skills = [s.lower().strip() for s in req_skills_raw if s]
            
            project_score = 0
            for ms in my_skills:
                match_found = False
                for rs in req_skills:
                    if ms in rs or rs in ms:
                        match_found = True
                        break
                if match_found:
                    project_score += 1
            
            scored_projects.append((project_score, p.created_at, p))
            
        scored_projects.sort(key=lambda x: (x[0], x[1]), reverse=True)
        
        # Take up to 50 items
        results_limit = 50
        sorted_projects = []
        for i in range(min(len(scored_projects), results_limit)):
            sorted_projects.append(scored_projects[i][2])
        
        serializer = self.get_serializer(sorted_projects, many=True)
        return Response(serializer.data)

