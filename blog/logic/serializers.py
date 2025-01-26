from rest_framework import serializers
from .models import *

class User_serializer(serializers.ModelSerializer):

    class Meta:
        
        model = User
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