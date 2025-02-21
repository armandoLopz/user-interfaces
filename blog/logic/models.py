from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):

    email = models.EmailField(unique=True, blank= False)
    cellphone = models.IntegerField(max_length=11, blank= False)
    personal_description = models.CharField(max_length=500)
    personal_site = models.CharField(max_length=70, blank= False)

class Configuration(models.Model):
    
    name = models.CharField(max_length=50)
    determinated = models.BooleanField(default=False)
    
    primary_color = models.CharField(max_length=50)
    secondary_color = models.CharField(max_length=50)
    accent_color = models.CharField(max_length=50)
    extra_color_1 = models.CharField(max_length=50)
    extra_color_2 = models.CharField(max_length=50)

    paragraph_size = models.CharField(max_length=50)
    title_size = models.CharField(max_length=50)
    subtitle_size = models.CharField(max_length=50)

    primary_tipography = models.CharField(max_length=50)
    secondary_tipography = models.CharField(max_length=50)
    
    user = models.ManyToManyField(User)

    class Meta:
        db_table = "configuration"

    def __str__(self):
        return self.name

"""        
class User(models.Model):

    #Add password
    name = models.CharField(max_length=30)
    lastname = models.CharField(max_length=45)
    email = models.EmailField(max_length=50, unique=True)
    cellphone = models.IntegerField()
    personal_description = models.CharField(max_length=500)
    personal_site = models.CharField(max_length=70)
    
    password = models.CharField(max_length=100)
    username = models.CharField(unique= True, max_length= 35)

    class Meta:
        db_table = "user"

    #Add picture field
    def __str__(self):
        return self.name + ' ' + self.lastname + ' ' + self.email 
"""

class Address(models.Model):
    country = models.CharField(max_length=25)
    city = models.CharField(max_length=55)
    street = models.CharField(max_length=125)

    user = models.ManyToManyField(User)

    class Meta:
        db_table = "address"

    def __str__(self):
        return self.country + ', ' + self.city + ', ' + self.street

class Work_experience(models.Model):

    name_company = models.CharField(max_length=40)
    description_of_the_job = models.CharField(max_length=700)
    job_title = models.CharField(max_length=700)
    start_work_date = models.DateField()
    end_work_date = models.DateField()

    user = models.ManyToManyField(User)

    currently_working = models.BooleanField(default=False)

    class Meta:
        db_table = "work_experience"

    def __str__(self):
        return self.name_company + ': ' + self.description_of_the_job

class Education(models.Model):

    name_institution = models.CharField(max_length=80)
    degree_studied = models.CharField(max_length=50)

    start_studied_date = models.DateField()
    end_studied_date = models.DateField()

    currently_studying = models.BooleanField(default= "False")

    user = models.ManyToManyField(User)

    class DegreeLevel(models.TextChoices):

        HIGH_SCHOOL = 'HS', _('High School')
        ASSOCIATE = 'AS', _('Associate\'s degree')
        BACHELOR = 'BA', _("Bachelor's degree")
        MASTER = 'MA', _("Master's degree")
        DOCTORATE = 'PhD', _('PhD')
        OTHER = 'OT', _('Other')

    #Specify the level if the degree level dont match whith the default values
    degree_level_other = models.CharField(max_length=20, blank=True, null=True, default="N/A")
    
    degree_level = models.CharField(
        max_length=3,
        choices=DegreeLevel,
        default=DegreeLevel.HIGH_SCHOOL,
    )
    
    class Meta:
        db_table = "education"

    def __str__(self):
        return self.name_institution
    
class Languages(models.Model): 

    name = models.CharField(max_length=20, blank= False)

    user = models.ManyToManyField(User)

    class languageLevel(models.TextChoices):

        BEGINNER = "BE", _("Beginner")
        INTERMEDIATE = "IN", _("Intermediate")
        ADVANCED = "AD", _("Advanced")
        NATIVE = "NA", _("Native")

    language_level = models.CharField(
        max_length=2,
        choices=languageLevel,
        default=languageLevel.BEGINNER,
    )

    class Meta:
        db_table = "languages"

    def __str__(self):
        return self.name
    
class Skills(models.Model):

    skill_name = models.CharField(max_length=30)
    skill_proficiency = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    user = models.ManyToManyField(User)

    class Meta:
        db_table = "skills"
        
    def __str__(self):
        return self.skill_name
    
class Competencies(models.Model):

    name_competencies = models.CharField(max_length=30)
    competencies_proficiency = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    user = models.ManyToManyField(User)
    class Meta:
        db_table = "competencies"
        
    def __str__(self):
        return self.name_competencies