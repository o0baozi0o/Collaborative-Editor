# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='File',
            fields=[
                ('Line', models.AutoField(primary_key=True, max_length=30, serialize=False)),
                ('String', models.CharField(max_length=60000)),
            ],
        ),
    ]
