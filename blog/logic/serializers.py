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