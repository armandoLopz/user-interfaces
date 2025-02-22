from rest_framework import viewsets
from .models import *
from .serializers import *

# Create your views here.

class User_view(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = User_serializer

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

class Work_experience_view(viewsets.ModelViewSet):
    queryset = Work_experience.objects.all()
    serializer_class = Work_experience_serializer

class Education_view(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = Education_serializer

class Languages_view(viewsets.ModelViewSet):
    queryset = Languages.objects.all()
    serializer_class = Languages_serializer

class Skills_view(viewsets.ModelViewSet):
    queryset = Skills.objects.all()
    serializer_class = Skills_serializer

class Competencies_view(viewsets.ModelViewSet):
    queryset = Competencies.objects.all()
    serializer_class = Competencies_serializer