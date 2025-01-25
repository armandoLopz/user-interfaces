from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

class User(models.Model):
    name = models.CharField(max_length=30)
    lastname = models.CharField(max_length=45)
    email = models.EmailField(max_length=50)
    cellphone = models.IntegerField()
    personal_description = models.CharField(max_length=500)
    personal_site = models.CharField(max_length=70)

    #Add picture field
    def __str__(self):
        return self.name + ' ' + self.lastname + ' ' + self.email

class Address(models.Model):
    country = models.CharField(max_length=25)
    city = models.CharField(max_length=55)
    street = models.CharField(max_length=125)

    user = models.ManyToManyField(User)

    def __str__(self):
        return self.country + ', ' + self.city + ', ' + self.street

class Work_experience(models.Model):

    name_company = models.CharField(max_length=40)
    description_of_the_job = models.CharField(max_length=700)

    start_work_date = models.DateField()
    end_work_date = models.DateField()

    user = models.ManyToManyField(User)

    def __str__(self):
        return self.name_company + ': ' + self.description_of_the_job

class Education(models.Model):

    name_institution = models.CharField(max_length=80)
    degree_studied = models.CharField(max_length=50)

    start_work_date = models.DateField()
    end_work_date = models.DateField()

    user = models.ManyToManyField(User)

    def __str__(self):
        return self.name_institution
    
class Languages(models.Model): 

    name = models.CharField(max_length=20)

    user = models.ManyToManyField(User)

    def __str__(self):
        return self.name
    
class Skils(models.Model):

    skill_name = models.CharField(max_length=30)
    skill_proficiency = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])

    def __str__(self):
        return self.skill_name
    
class Competencies(models.Model):

    name_competencies = models.CharField(max_length=30)
    name_proficiency = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    def __str__(self):
        return self.name_competencies