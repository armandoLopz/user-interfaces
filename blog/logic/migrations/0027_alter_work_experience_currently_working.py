# Generated by Django 5.1.6 on 2025-04-28 20:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logic', '0026_alter_education_end_studied_date_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='work_experience',
            name='currently_working',
            field=models.BooleanField(default=False, null=True),
        ),
    ]
