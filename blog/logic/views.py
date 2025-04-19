from rest_framework import viewsets
from .models import *
from .serializers import *

# Create your views here.

class User_view(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = User_serializer

class Video_view(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = Video_serializer

class Image_view(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = Image_serializer

class Configuration_View(viewsets.ModelViewSet):
    queryset = Configuration.objects.all()
    serializer_class = Configuration_serializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            # Filtra las configuraciones cuyo campo 'user' tenga el ID especificado
            return Configuration.objects.filter(user__id=user_id)
        else:
            return super().get_queryset()

class Address_view(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = Address_serializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            
            return Address.objects.filter(user__id=user_id)
        else:
            return super().get_queryset()

class Work_experience_view(viewsets.ModelViewSet):
    queryset = Work_experience.objects.all()
    serializer_class = Work_experience_serializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            
            return Work_experience.objects.filter(user__id=user_id)
        else:
            return super().get_queryset()
        
class Education_view(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = Education_serializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            
            return Education.objects.filter(user__id=user_id)
        else:
            return super().get_queryset()
        
class Languages_view(viewsets.ModelViewSet):
    queryset = Languages.objects.all()
    serializer_class = Languages_serializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            
            return Languages.objects.filter(user__id=user_id)
        else:
            return super().get_queryset()

class Skills_view(viewsets.ModelViewSet):
    queryset = Skills.objects.all()
    serializer_class = Skills_serializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            
            return Skills.objects.filter(user__id=user_id)
        else:
            return super().get_queryset()

class Competencies_view(viewsets.ModelViewSet):
    queryset = Competencies.objects.all()
    serializer_class = Competencies_serializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user', None)
        if user_id is not None:
            
            return Competencies.objects.filter(user__id=user_id)
        else:
            return super().get_queryset()