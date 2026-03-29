from django.urls import path
from . import views

app_name = 'ai_services'

urlpatterns = [
    path('generate-proposal/', views.ProposalGeneratorView.as_view(), name='generate-proposal'),
    path('generate-description/', views.ProjectDescriptionGeneratorView.as_view(), name='generate-description'),
    path('matchmaking/', views.SkillMatchmakingView.as_view(), name='matchmaking'),
    path('spam-detection/', views.SpamDetectionView.as_view(), name='spam-detection'),
]
