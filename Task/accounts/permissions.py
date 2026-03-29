from rest_framework.permissions import BasePermission


class IsFreelancer(BasePermission):
    """Allow only freelancers."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'freelancer'
            and not request.user.is_banned
        )


class IsClient(BasePermission):
    """Allow only clients."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'client'
            and not request.user.is_banned
        )


class IsAdmin(BasePermission):
    """Allow only admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == 'admin' or request.user.is_staff)
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow object owner or admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin' or request.user.is_staff:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class IsClientOrAdmin(BasePermission):
    """Allow clients or admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('client', 'admin')
            and not request.user.is_banned
        )


class IsNotBanned(BasePermission):
    """Deny banned users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and not request.user.is_banned
        )
