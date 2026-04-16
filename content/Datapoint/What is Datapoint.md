---
title: Getting Started with Datapoint 
description: A quick guide to our MeteoMaps DataPoint 
navigation:
  icon: i-lucide-house
seo:
  title: Getting Started with Statistics
  description: A quick guide to our stats dashboard
---

## What is Datapoint?

A community-driven climate data platform built for weather enthusiasts, researchers, and contributors who want to share and explore historical temperature and rainfall records.

# The Structure

## CET (Central England Temperature)
The Central England Temperature (CET) is the longest instrumental climate record in the world, dating back to 1659.
It measures the mean surface air temperature over a roughly triangular area of central England, bounded approximately by:

Bristol (south-west)
Lancashire (north)
London (south-east)

It was originally constructed by climatologist Gordon Manley, who compiled historical records to produce a continuous monthly series. The Met Office's Hadley Centre now maintains and updates it.

It's widely used as a benchmark for long-term climate trends in England, and because of its length it's particularly valuable for identifying multi-decadal patterns, warming trends, and seasonal shifts. For example, 2022 was the first year on record where the annual CET exceeded 11°C.

It's worth noting that the CET doesn't represent the whole of the UK -- Scotland, Wales, and Northern Ireland have their own records -- but it's often used as a proxy for broader English climate trends given its length and continuity. 

We wanted to pull this data and display it in a more user friendly way.

## Dataset Directory
A dataset library where all contributed climate records are listed. It has two sub-pages:

### Browse
Lists all public datasets grouped by their contributing user, showing the uploader's profile (name, username, bio, avatar) alongside their datasets. Each dataset card shows its name, description, row count, and upload date. Users can click any dataset to open a detailed data table.

### Reports
An aggregated analytics view across all public datasets, showing four interactive SVG charts: annual temperature trend, monthly temperature profile, annual rainfall, and monthly rainfall profile. Summary stat cards show overall averages. A "Dataset settings" button lets signed-in users control which of their own datasets are included in report calculations.
