from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password

class User_serializer(serializers.ModelSerializer):
    
    class Meta:
        
        model = User
        fields = ('__all__')
            
    def create(self, validated_data):
        
        #Hash password before create the user
        validated_data['password'] = make_password(validated_data['password'])
        
        return super().create(validated_data)

class Video_serializer(serializers.ModelSerializer):

    class Meta:
        
        model = Video
        fields = ('__all__')

class Image_serializer(serializers.ModelSerializer):

    class Meta:
        
        model = Image
        fields = ('__all__')

class Configuration_serializer(serializers.ModelSerializer):

    class Meta:
        
        model = Configuration
        fields = ('__all__')
        
class Address_serializer(serializers.ModelSerializer):

    class Meta:
        
        model = Address
        fields = ('__all__')

class Work_experience_serializer(serializers.ModelSerializer):

    class Meta:
        
        model = Work_experience
        fields = ('__all__')

class Education_serializer(serializers.ModelSerializer):

    class Meta:
        
        model = Education
        fields = ('__all__')

class Languages_serializer(serializers.ModelSerializer):

    class Meta:
        
        model = Languages
        fields = ('__all__')

class Skills_serializer(serializers.ModelSerializer):

    class Meta:
        
        model = Skills
        fields = ('__all__')

class Competencies_serializer(serializers.ModelSerializer):

    class Meta:
        
        model = Competencies
        fields = ('__all__')

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar el detalle de un usuario,
    agrupando todos los datos (incluyendo relaciones) dentro
    de un único objeto 'user'.
    """
    addresses = serializers.SerializerMethodField()
    work_experiences = serializers.SerializerMethodField()
    educations = serializers.SerializerMethodField()
    languages = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    competencies = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'cellphone', 'personal_description', 'personal_site',
            'profile_picture', 'addresses', 'work_experiences', 'educations',
            'languages', 'skills', 'competencies'
        ]

    def get_addresses(self, user):
        return Address_serializer(user.address_set.all(), many=True).data

    def get_work_experiences(self, user):
        return Work_experience_serializer(user.work_experience_set.all(), many=True).data

    def get_educations(self, user):
        return Education_serializer(user.education_set.all(), many=True).data

    def get_languages(self, user):
        return Languages_serializer(user.languages_set.all(), many=True).data

    def get_skills(self, user):
        return Skills_serializer(user.skills_set.all(), many=True).data

    def get_competencies(self, user):
        return Competencies_serializer(user.competencies_set.all(), many=True).data

    def to_representation(self, instance):
        """
        Agrupa todos los campos y relaciones dentro de un único objeto 'user'.
        Ejemplo de salida:
        {
            "user": {
                "id": 3,
                "username": "al22",
                "email": "...",
                "first_name": "Armando",
                "last_name": "López",
                "cellphone": 1234567,
                "personal_description": "...",
                "personal_site": "...",
                "addresses": [ ... ],
                "work_experiences": [ ... ],
                "educations": [ ... ],
                "languages": [ ... ],
                "skills": [ ... ],
                "competencies": [ ... ]
            }
        }
        """
        data = super().to_representation(instance)
        return { 'result': data }
