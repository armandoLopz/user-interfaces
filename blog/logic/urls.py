from django.urls import include, path
from rest_framework import routers
from .views import *
from django.conf.urls.static import static
from django.conf import settings

router = routers.DefaultRouter()
router.register('users', User_view)
router.register('videos', Video_view)
router.register('images', Image_view)
router.register('configurations', Configuration_View) 
router.register('addresses', Address_view) 
router.register('work_experiences', Work_experience_view) 
router.register('educations', Education_view) 
router.register('languages', Languages_view) 
router.register('skills', Skills_view) 
router.register('competencies', Competencies_view) 

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/users/<int:pk>/detail/', UserDetailView.as_view()),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)