# Generated by Django 5.1.6 on 2025-04-19 13:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('logic', '0019_image_video'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='image',
            table='image',
        ),
        migrations.AlterModelTable(
            name='video',
            table='video',
        ),
    ]
