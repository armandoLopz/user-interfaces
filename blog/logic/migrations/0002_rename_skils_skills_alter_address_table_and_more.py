# Generated by Django 5.1.1 on 2025-01-25 22:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('logic', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Skils',
            new_name='Skills',
        ),
        migrations.AlterModelTable(
            name='address',
            table='address',
        ),
        migrations.AlterModelTable(
            name='competencies',
            table='competencies',
        ),
        migrations.AlterModelTable(
            name='education',
            table='education',
        ),
        migrations.AlterModelTable(
            name='languages',
            table='languages',
        ),
        migrations.AlterModelTable(
            name='skills',
            table='skills',
        ),
        migrations.AlterModelTable(
            name='user',
            table='user',
        ),
        migrations.AlterModelTable(
            name='work_experience',
            table='work_experience',
        ),
    ]
