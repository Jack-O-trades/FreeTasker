from rest_framework.permissions import BasePermission


class IsFreelancer(BasePermission):
    """Allow only freelancers."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_banned:
            self.message = f"Your account has been banned. Reason: {request.user.ban_reason or 'Violation of terms'}."
            return False
        if request.user.role != 'freelancer':
            self.message = f"This action requires a Freelancer account. Your current role is: {request.user.role}."
            return False
        return True


class IsClient(BasePermission):
    """Allow only clients."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_banned:
            self.message = f"Your account has been banned. Reason: {request.user.ban_reason or 'Violation of terms'}."
            return False
        if request.user.role != 'client':
            self.message = f"This action requires a Client account. Your current role is: {request.user.role}."
            return False
        return True


class IsAdmin(BasePermission):
    """Allow only admins."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not (request.user.role == 'admin' or request.user.is_staff):
            self.message = "This action requires an Administrator account."
            return False
        return True


class IsOwnerOrAdmin(BasePermission):
    """Allow object owner or admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin' or request.user.is_staff:
            return True
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        if obj == request.user:
            return True
        self.message = "You must be the owner of this object to modify it."
        return False


class IsClientOrAdmin(BasePermission):
    """Allow clients or admins."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_banned:
            self.message = f"Your account has been banned. Reason: {request.user.ban_reason or 'Violation of terms'}."
            return False
        if request.user.role not in ('client', 'admin'):
            self.message = "This action requires a Client or Administrator account."
            return False
        return True


class IsNotBanned(BasePermission):
    """Deny banned users."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_banned:
            self.message = f"Your account has been banned. Reason: {request.user.ban_reason or 'Violation of terms'}."
            return False
        return True
