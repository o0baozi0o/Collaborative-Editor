from django.db import models

# Create your models here.
class File(models.Model):
    Line = models.AutoField(primary_key=True,max_length=30)
    String = models.CharField(max_length=60000)
