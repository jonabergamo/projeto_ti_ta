# Generated by Django 4.2.7 on 2023-12-11 20:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_incubatordevice_last_completion_data'),
    ]

    operations = [
        migrations.AlterField(
            model_name='incubatordevice',
            name='last_completion_data',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
