from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsNotBanned


class ProposalGeneratorView(APIView):
    """
    AI-powered proposal generator placeholder.
    In production, integrate with OpenAI/Claude/Gemini API.
    """

    permission_classes = [permissions.IsAuthenticated, IsNotBanned]

    def post(self, request):
        project_title = request.data.get('project_title', '')
        project_description = request.data.get('project_description', '')
        freelancer_skills = request.data.get('skills', [])

        if not project_description:
            return Response(
                {'error': 'project_description is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Placeholder response
        proposal = (
            f"Dear Client,\n\n"
            f"I am excited to apply for your project \"{project_title}\". "
            f"After reviewing your requirements, I am confident that my expertise "
            f"in {', '.join(freelancer_skills) if freelancer_skills else 'relevant technologies'} "
            f"makes me an ideal candidate.\n\n"
            f"I have successfully completed similar projects and can deliver "
            f"high-quality results within your timeline.\n\n"
            f"Looking forward to discussing this opportunity.\n\n"
            f"Best regards"
        )

        return Response({
            'generated_proposal': proposal,
            'ai_model': 'placeholder',
            'note': 'This is a placeholder. Integrate with an AI API for production use.',
        })


class ProjectDescriptionGeneratorView(APIView):
    """
    AI-powered project description generator placeholder.
    """

    permission_classes = [permissions.IsAuthenticated, IsNotBanned]

    def post(self, request):
        title = request.data.get('title', '')
        keywords = request.data.get('keywords', [])
        budget_range = request.data.get('budget_range', '')

        if not title:
            return Response(
                {'error': 'title is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        description = (
            f"We are looking for a skilled professional to help with \"{title}\". "
            f"The ideal candidate should have experience with "
            f"{', '.join(keywords) if keywords else 'relevant technologies'}.\n\n"
            f"Requirements:\n"
            f"- Strong understanding of the project scope\n"
            f"- Ability to deliver within the agreed timeline\n"
            f"- Clear communication throughout the project\n"
            f"- Quality assurance and testing\n\n"
            f"Please include relevant portfolio examples with your proposal."
        )

        return Response({
            'generated_description': description,
            'ai_model': 'placeholder',
        })


class SkillMatchmakingView(APIView):
    """
    AI-powered skill-based matchmaking placeholder.
    Matches freelancers to projects based on skills.
    """

    permission_classes = [permissions.IsAuthenticated, IsNotBanned]

    def post(self, request):
        project_id = request.data.get('project_id')
        required_skills = request.data.get('required_skills', [])

        if not required_skills:
            return Response(
                {'error': 'required_skills is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Basic skill matching (placeholder for AI-powered matching)
        from accounts.models import FreelancerProfile
        from django.db.models import Q

        # Simple query-based matching
        query = Q()
        for skill in required_skills:
            query |= Q(skills__icontains=skill)

        matches = FreelancerProfile.objects.filter(
            query,
            is_available=True,
            user__is_banned=False,
        ).select_related('user').order_by('-avg_rating')[:20]

        results = []
        for profile in matches:
            skill_overlap = sum(
                1 for s in required_skills
                if any(s.lower() in ps.lower() for ps in profile.skills)
            )
            results.append({
                'freelancer_id': profile.user.id,
                'email': profile.user.email,
                'name': profile.user.get_full_name() or profile.user.username,
                'skills': profile.skills,
                'avg_rating': float(profile.avg_rating),
                'completed_projects': profile.completed_projects,
                'match_score': round(skill_overlap / max(len(required_skills), 1) * 100, 1),
            })

        # Sort by match score
        results.sort(key=lambda x: (-x['match_score'], -x['avg_rating']))

        return Response({
            'matches': results,
            'total': len(results),
            'ai_model': 'basic_skill_matching',
        })


class SpamDetectionView(APIView):
    """
    AI-powered spam detection hook placeholder.
    """

    permission_classes = [permissions.IsAuthenticated, IsNotBanned]

    def post(self, request):
        text = request.data.get('text', '')

        if not text:
            return Response(
                {'error': 'text is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from reports.utils import detect_spam_patterns
        is_spam, reason = detect_spam_patterns(text)

        return Response({
            'text': text[:200],
            'is_spam': is_spam,
            'reason': reason,
            'confidence': 0.85 if is_spam else 0.15,
            'ai_model': 'rule_based',
            'note': 'Replace with ML model for production use.',
        })
