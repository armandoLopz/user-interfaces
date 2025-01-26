from django.urls import include, path
from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register('users', User_view) 
router.register('addresses', Address_view) 
router.register('work_experiences', Work_experience_view) 
router.register('educations', Education_view) 
router.register('languages', Languages_view) 
router.register('skills', Skills_view) 
router.register('competencies', Competencies_view) 

urlpatterns = [
    path('api/', include(router.urls))
]