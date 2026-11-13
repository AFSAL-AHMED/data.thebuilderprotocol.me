"""
Seed script for TBP Dataset Commons.

Creates:
  - 1 admin user   (admin@thebuilderprotocol.me / TBPAdmin2026!)
  - 1 contributor  (demo@thebuilderprotocol.me  / Demo2026!)
  - 10 sample datasets (is_sample_data=True, status=approved)
  - 3 collections

Usage:
    cd backend
    python seed.py
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta

# Allow running from the backend/ directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select

from app.config import settings
from app.database import Base
from app.models import User, Dataset, Collection, ActivityLog
from app.models.user import UserRole
from app.models.dataset import DatasetCategory, DatasetLicence, DatasetStatus, QualitySource
from app.services.auth_service import hash_password
from app.services.dataset_service import slugify


engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


SAMPLE_DATASETS = [
    {
        "title": "Indian Language Sentiment Analysis Dataset",
        "short_description": "50,000 annotated sentences across 5 Indian languages for sentiment analysis tasks.",
        "full_description": (
            "This dataset contains 50,000 manually annotated sentences in Hindi, Bengali, Tamil, Telugu, and Marathi, "
            "each labelled with positive, negative, or neutral sentiment. It was collected from social media platforms, "
            "product reviews, and news commentary between 2021 and 2023. The dataset is balanced across languages and "
            "includes speaker demographic metadata where available. Ideal for training multilingual NLP models and "
            "benchmarking sentiment classification on low-resource Indian languages."
        ),
        "category": DatasetCategory.nlp,
        "tags": ["sentiment-analysis", "indian-languages", "hindi", "bengali", "tamil", "NLP", "text-classification"],
        "source_url": "https://huggingface.co/datasets/tbp/indian-sentiment-analysis",
        "download_url": "https://huggingface.co/datasets/tbp/indian-sentiment-analysis/resolve/main/data.csv",
        "file_format": ["CSV"],
        "licence": DatasetLicence.cc_by,
        "language": ["Hindi", "Bengali", "Tamil", "Telugu", "Marathi"],
        "collection_method": "Collected from Twitter, Amazon India reviews, and regional news portals. Annotated by bilingual crowd workers via Appen.",
        "intended_use": "Training and evaluating multilingual sentiment classifiers for Indian languages.",
        "known_limitations": "Class imbalance exists for Telugu and Marathi. Social media text may contain code-switching.",
        "citation_info": "TBP (2024). Indian Language Sentiment Analysis Dataset (v1.0). The Builder Protocol.",
        "geographic_coverage": "India",
        "num_records": 50000,
        "num_columns": 6,
        "file_size_bytes": 18874368,
        "quality_source": QualitySource.human_reviewed,
    },
    {
        "title": "Urban Air Quality Measurements India 2020-2024",
        "short_description": "200,000+ hourly air quality readings from 120 CPCB monitoring stations across Indian cities.",
        "full_description": (
            "Hourly particulate matter (PM2.5, PM10), NO2, SO2, CO, ozone, and AQI readings from 120 Central Pollution "
            "Control Board (CPCB) monitoring stations in 35 Indian cities from January 2020 to December 2024. "
            "Data is provided in both CSV and JSON formats. The dataset captures pre- and post-COVID lockdown pollution "
            "patterns and seasonal variations. Station metadata including GPS coordinates and urban classification are included."
        ),
        "category": DatasetCategory.climate_environment,
        "tags": ["air-quality", "pollution", "AQI", "PM2.5", "India", "CPCB", "environment", "climate"],
        "source_url": "https://data.thebuilderprotocol.me/datasets/urban-air-quality-india",
        "download_url": "https://data.thebuilderprotocol.me/datasets/urban-air-quality-india/download",
        "file_format": ["CSV", "JSON"],
        "licence": DatasetLicence.cc0,
        "language": ["English"],
        "collection_method": "Automated sensor readings from CPCB continuous ambient air quality monitoring stations.",
        "intended_use": "Environmental research, pollution forecasting, public health studies.",
        "known_limitations": "Some stations have gaps due to sensor downtime. Data quality varies across older stations.",
        "citation_info": "TBP (2024). Urban Air Quality Measurements India 2020-2024. The Builder Protocol.",
        "geographic_coverage": "India — 35 major cities",
        "num_records": 200000,
        "num_columns": 15,
        "file_size_bytes": 104857600,
        "quality_source": QualitySource.auto_calculated,
    },
    {
        "title": "GitHub Repository Metadata Corpus",
        "short_description": "Metadata for 500,000 public GitHub repositories including stars, forks, languages, and topics.",
        "full_description": (
            "A large-scale corpus of metadata for 500,000 public GitHub repositories scraped via the GitHub REST API "
            "in 2024. Each record includes repository name, owner, description, primary language, all languages used, "
            "star count, fork count, open issue count, topics, licence, creation date, last push date, and size. "
            "The dataset is useful for software ecosystem research, repository recommendation systems, and mining "
            "open-source software trends."
        ),
        "category": DatasetCategory.software_engineering,
        "tags": ["github", "open-source", "repositories", "software-mining", "metadata", "ecosystems"],
        "source_url": "https://github.com/thebuilderprotocol/github-repo-corpus",
        "download_url": "https://github.com/thebuilderprotocol/github-repo-corpus/releases/download/v1/data.json.gz",
        "file_format": ["JSON"],
        "licence": DatasetLicence.apache_2,
        "language": ["English"],
        "collection_method": "Collected via GitHub REST API v3 with authenticated rate-limit handling. Sampling based on star count stratification.",
        "intended_use": "Software engineering research, repository classification, trend analysis.",
        "known_limitations": "Snapshot from a single collection date; fork and star counts may be outdated. Private repositories not included.",
        "citation_info": "TBP (2024). GitHub Repository Metadata Corpus (v1.0). The Builder Protocol. Apache 2.0.",
        "geographic_coverage": "Global",
        "num_records": 500000,
        "num_columns": 18,
        "file_size_bytes": 524288000,
        "quality_source": QualitySource.auto_calculated,
    },
    {
        "title": "Indian Agricultural Crop Yield Dataset 1997-2023",
        "short_description": "District-level crop yield data for 25 major crops across all Indian states from 1997 to 2023.",
        "full_description": (
            "This dataset compiles district-level annual yield (kg/hectare), area sown (hectares), and total production "
            "(tonnes) for 25 major crops across all Indian states and union territories from 1997 to 2023. Data is "
            "sourced from Ministry of Agriculture & Farmers Welfare (MoAFW) state-wise season-wise production reports. "
            "Covers Kharif, Rabi, and Zaid seasons. Useful for agricultural productivity analysis, food security "
            "research, and climate impact studies."
        ),
        "category": DatasetCategory.scientific_research,
        "tags": ["agriculture", "crop-yield", "India", "food-security", "district-level", "MoAFW"],
        "source_url": "https://data.gov.in/catalog/district-wise-season-wise-crop-production-statistics",
        "download_url": "https://data.thebuilderprotocol.me/datasets/indian-crop-yield/download",
        "file_format": ["CSV"],
        "licence": DatasetLicence.cc_by,
        "language": ["English"],
        "collection_method": "Compiled from Ministry of Agriculture state reports and Open Government Data Platform India.",
        "intended_use": "Agricultural policy analysis, yield prediction, climate impact modelling.",
        "known_limitations": "Some districts have incomplete records for certain years. Yield estimation methodology may vary between states.",
        "citation_info": "TBP (2024). Indian Agricultural Crop Yield Dataset 1997-2023 (v1.0). The Builder Protocol.",
        "geographic_coverage": "All Indian states and union territories",
        "num_records": 150000,
        "num_columns": 10,
        "file_size_bytes": 31457280,
        "quality_source": QualitySource.human_reviewed,
    },
    {
        "title": "Stack Overflow Developer Survey Responses 2024",
        "short_description": "Anonymised responses from 65,000 developers in the 2024 Stack Overflow Annual Developer Survey.",
        "full_description": (
            "The 2024 Stack Overflow Annual Developer Survey collected responses from over 65,000 software developers "
            "worldwide. This dataset includes anonymised responses covering programming languages used, years of "
            "experience, employment type, compensation, remote work preferences, AI tool usage, education background, "
            "and demographic information. Useful for technology trend analysis, compensation benchmarking, and "
            "understanding the developer community globally."
        ),
        "category": DatasetCategory.public_data,
        "tags": ["developer-survey", "stackoverflow", "programming", "salary", "technology-trends", "2024"],
        "source_url": "https://survey.stackoverflow.co/2024",
        "download_url": "https://data.thebuilderprotocol.me/datasets/stackoverflow-survey-2024/download",
        "file_format": ["CSV"],
        "licence": DatasetLicence.other,
        "language": ["English"],
        "collection_method": "Annual online survey distributed via Stack Overflow platform. Self-reported responses.",
        "intended_use": "Technology trend research, compensation analysis, HR benchmarking.",
        "known_limitations": "Self-selection bias. Primarily English-speaking respondents. Compensation data self-reported.",
        "citation_info": "Stack Overflow (2024). Developer Survey 2024. ODbL Licence.",
        "geographic_coverage": "Global",
        "num_records": 65000,
        "num_columns": 85,
        "file_size_bytes": 52428800,
        "quality_source": QualitySource.contributor_provided,
    },
    {
        "title": "Satellite Imagery Annotation Dataset India — Land Use",
        "short_description": "25,000 annotated satellite image patches covering urban, agricultural, forest, and water body classes across India.",
        "full_description": (
            "A computer vision dataset containing 25,000 annotated satellite image patches at 10m resolution from "
            "Sentinel-2 imagery covering India. Each patch is 256x256 pixels and labelled with one of 8 land-use "
            "classes: urban/built-up, cropland, forest, water body, barren land, wetlands, shrubland, and snow/glacier. "
            "Annotations are in COCO JSON format. The dataset covers all major ecological zones of India and is "
            "suitable for semantic segmentation and land-use classification models."
        ),
        "category": DatasetCategory.computer_vision,
        "tags": ["satellite-imagery", "land-use", "semantic-segmentation", "Sentinel-2", "India", "remote-sensing", "COCO"],
        "source_url": "https://data.thebuilderprotocol.me/datasets/satellite-imagery-india",
        "download_url": "https://data.thebuilderprotocol.me/datasets/satellite-imagery-india/download",
        "file_format": ["JSON"],
        "licence": DatasetLicence.cc_by_sa,
        "language": ["English"],
        "collection_method": "Sentinel-2 imagery from ESA Copernicus programme. Manual annotation by remote sensing experts.",
        "intended_use": "Land use classification, urban sprawl detection, forest cover monitoring.",
        "known_limitations": "Cloud cover in some patches. Annotation quality may vary in ambiguous boundary zones.",
        "citation_info": "TBP (2024). Satellite Imagery Annotation Dataset India v1.0. CC BY-SA 4.0.",
        "geographic_coverage": "Pan-India coverage across major ecological zones",
        "num_records": 25000,
        "num_columns": 8,
        "file_size_bytes": 10737418240,
        "quality_source": QualitySource.human_reviewed,
    },
    {
        "title": "Indian Regional Language Text Corpus",
        "short_description": "2 million sentences across 12 Indian languages sourced from news, Wikipedia, and literature.",
        "full_description": (
            "A large multilingual text corpus containing approximately 2 million sentences across 12 Indian languages: "
            "Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia, Assamese, and Urdu. "
            "Text is sourced from Wikipedia dumps (2024), CC-licensed news archives, and digitised literary works. "
            "Provided in both plain text (.txt per language) and a unified CSV with language labels. Suitable for "
            "language modelling, machine translation, and cross-lingual NLP research."
        ),
        "category": DatasetCategory.language_culture,
        "tags": ["multilingual", "indian-languages", "NLP", "corpus", "language-modelling", "Wikipedia", "text"],
        "source_url": "https://data.thebuilderprotocol.me/datasets/indian-language-corpus",
        "download_url": "https://data.thebuilderprotocol.me/datasets/indian-language-corpus/download",
        "file_format": ["TXT", "CSV"],
        "licence": DatasetLicence.cc_by,
        "language": ["Hindi", "Bengali", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Gujarati", "Punjabi", "Odia"],
        "collection_method": "Wikipedia XML dumps processed with wikiextractor. News archives crawled with robots.txt compliance.",
        "intended_use": "Language modelling, machine translation, cross-lingual transfer learning.",
        "known_limitations": "Wikipedia text may be formal; dialectal variation not represented. Some languages have fewer sentences.",
        "citation_info": "TBP (2024). Indian Regional Language Text Corpus v1.0. CC BY 4.0.",
        "geographic_coverage": "India",
        "num_records": 2000000,
        "num_columns": 3,
        "file_size_bytes": 2147483648,
        "quality_source": QualitySource.auto_calculated,
    },
    {
        "title": "OpenStreetMap POI Dataset South Asia",
        "short_description": "800,000 points of interest from OpenStreetMap covering India, Pakistan, Bangladesh, Sri Lanka, and Nepal.",
        "full_description": (
            "A curated GeoJSON dataset of 800,000 points of interest (POIs) extracted from OpenStreetMap for South "
            "Asian countries: India, Pakistan, Bangladesh, Sri Lanka, and Nepal. POI categories include hospitals, "
            "schools, restaurants, ATMs, transit stops, religious sites, markets, and government buildings. Each "
            "feature includes OSM ID, coordinates, name, category, subcategory, and available tags. Data extracted "
            "from the January 2025 OSM planet dump using Overpass API and osmium-tool."
        ),
        "category": DatasetCategory.geospatial,
        "tags": ["OpenStreetMap", "POI", "geospatial", "South-Asia", "India", "GeoJSON", "mapping"],
        "source_url": "https://data.thebuilderprotocol.me/datasets/osm-poi-south-asia",
        "download_url": "https://data.thebuilderprotocol.me/datasets/osm-poi-south-asia/download",
        "file_format": ["GeoJSON"],
        "licence": DatasetLicence.other,
        "language": ["English", "Hindi", "Urdu", "Bengali"],
        "collection_method": "Extracted from OSM planet dump (Jan 2025) using osmium-tool and Overpass queries.",
        "intended_use": "Location-based services, route planning, urban analytics, accessibility research.",
        "known_limitations": "OSM coverage is uneven; rural areas may be under-represented. Names available only where tagged in OSM.",
        "citation_info": "OpenStreetMap contributors (2025). POI Dataset South Asia via The Builder Protocol. ODbL.",
        "geographic_coverage": "India, Pakistan, Bangladesh, Sri Lanka, Nepal",
        "num_records": 800000,
        "num_columns": 12,
        "file_size_bytes": 629145600,
        "quality_source": QualitySource.auto_calculated,
    },
    {
        "title": "Code Bug Fix Pairs Dataset",
        "short_description": "120,000 paired buggy/fixed code snippets in Python, Java, C++, and JavaScript from GitHub commits.",
        "full_description": (
            "A dataset of 120,000 paired code snippets comprising a buggy version and its corresponding human fix, "
            "extracted from GitHub commit history. Languages covered: Python (45k pairs), Java (35k pairs), "
            "C++ (25k pairs), and JavaScript (15k pairs). Each pair includes the commit message, diff, bug category "
            "(null pointer, off-by-one, type error, logic error, etc.), and repository metadata. "
            "Useful for automated program repair, bug detection, and code review research."
        ),
        "category": DatasetCategory.software_engineering,
        "tags": ["bug-fix", "automated-repair", "code", "Python", "Java", "C++", "JavaScript", "GitHub", "commits"],
        "source_url": "https://github.com/thebuilderprotocol/code-bug-fix-pairs",
        "download_url": "https://github.com/thebuilderprotocol/code-bug-fix-pairs/releases/download/v1/dataset.json.gz",
        "file_format": ["JSON"],
        "licence": DatasetLicence.mit,
        "language": ["English"],
        "collection_method": "Mined from public GitHub repositories using PyGitHub. Filtered for single-hunk fixes with meaningful commit messages.",
        "intended_use": "Automated program repair, bug detection, code review automation.",
        "known_limitations": "Only single-file, single-function fixes included. Quality of commit messages varies.",
        "citation_info": "TBP (2024). Code Bug Fix Pairs Dataset v1.0. The Builder Protocol. MIT.",
        "geographic_coverage": "Global",
        "num_records": 120000,
        "num_columns": 14,
        "file_size_bytes": 262144000,
        "quality_source": QualitySource.auto_calculated,
    },
    {
        "title": "Biodiversity Observation Records India 2010-2024",
        "short_description": "300,000 georeferenced wildlife and plant observation records from citizen science programmes across India.",
        "full_description": (
            "A compilation of 300,000 georeferenced biodiversity observation records from India spanning 2010 to 2024, "
            "aggregated from iNaturalist India, the Indian Biodiversity Portal, and eBird. Records include species name "
            "(scientific and common), taxonomy, observer ID (anonymised), date, GPS coordinates, habitat type, "
            "observation method, and verification status. Covers mammals, birds, reptiles, amphibians, insects, and "
            "plants. Useful for species distribution modelling, conservation planning, and phenology research."
        ),
        "category": DatasetCategory.scientific_research,
        "tags": ["biodiversity", "wildlife", "citizen-science", "India", "iNaturalist", "eBird", "species", "ecology"],
        "source_url": "https://data.thebuilderprotocol.me/datasets/biodiversity-india",
        "download_url": "https://data.thebuilderprotocol.me/datasets/biodiversity-india/download",
        "file_format": ["CSV"],
        "licence": DatasetLicence.cc_by,
        "language": ["English"],
        "collection_method": "Aggregated from iNaturalist API, Indian Biodiversity Portal OGC service, and eBird EBD export.",
        "intended_use": "Species distribution modelling, conservation planning, climate-biodiversity interaction studies.",
        "known_limitations": "Observation density biased towards accessible areas. Amateur observers may misidentify species.",
        "citation_info": "TBP (2024). Biodiversity Observation Records India 2010-2024 (v1.0). CC BY 4.0.",
        "geographic_coverage": "Pan-India including Andaman & Nicobar Islands",
        "num_records": 300000,
        "num_columns": 20,
        "file_size_bytes": 157286400,
        "quality_source": QualitySource.human_reviewed,
    },
]

SAMPLE_COLLECTIONS = [
    {
        "title": "Indian NLP & Language Resources",
        "slug": "indian-nlp-language-resources",
        "description": (
            "A curated collection of natural language processing datasets and text corpora focused on Indian languages. "
            "Covers sentiment analysis, multilingual text, and language modelling resources for researchers and practitioners "
            "working on low-resource Indian language AI."
        ),
        "is_featured": True,
        "dataset_indices": [0, 6],  # Indian Language Sentiment Analysis + Indian Regional Language Text Corpus
    },
    {
        "title": "Climate & Environment Data India",
        "slug": "climate-environment-india",
        "description": (
            "Environmental and climate datasets focused on the Indian subcontinent, including air quality measurements, "
            "biodiversity observations, and agricultural data. Essential for environmental researchers and policymakers."
        ),
        "is_featured": True,
        "dataset_indices": [1, 3, 9],  # Air Quality + Crop Yield + Biodiversity
    },
    {
        "title": "Software Engineering Research Datasets",
        "slug": "software-engineering-research",
        "description": (
            "Datasets for software engineering research including GitHub repository metadata, code bug-fix pairs, "
            "and developer surveys. Ideal for MSR (Mining Software Repositories) and empirical software engineering studies."
        ),
        "is_featured": False,
        "dataset_indices": [2, 4, 8],  # GitHub Corpus + SO Survey + Bug Fix Pairs
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        result = await db.execute(select(User).where(User.email == "admin@thebuilderprotocol.me"))
        if result.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        print("Seeding users...")
        now = datetime.utcnow()

        admin_user = User(
            id=uuid.uuid4(),
            email="admin@thebuilderprotocol.me",
            username="tbp_admin",
            hashed_password=hash_password("TBPAdmin2026!"),
            full_name="TBP Admin",
            bio="Administrator of The Builder Protocol Dataset Commons.",
            organisation="The Builder Protocol",
            areas_of_interest=["AI/ML", "Open Data", "NLP", "Climate"],
            role=UserRole.admin,
            is_active=True,
            is_email_verified=True,
            created_at=now,
            updated_at=now,
        )

        demo_user = User(
            id=uuid.uuid4(),
            email="demo@thebuilderprotocol.me",
            username="demo_contributor",
            hashed_password=hash_password("Demo2026!"),
            full_name="Demo Contributor",
            bio="Sample contributor account for The Builder Protocol Dataset Commons.",
            organisation="The Builder Protocol",
            areas_of_interest=["NLP", "Computer Vision", "Data Science"],
            role=UserRole.contributor,
            is_active=True,
            is_email_verified=True,
            created_at=now,
            updated_at=now,
        )

        db.add(admin_user)
        db.add(demo_user)
        await db.flush()
        print(f"  Created admin: {admin_user.email}")
        print(f"  Created contributor: {demo_user.email}")

        print("Seeding datasets...")
        dataset_objects = []
        for i, ds_data in enumerate(SAMPLE_DATASETS):
            # Build slug
            base_slug = slugify(ds_data["title"])
            slug = base_slug
            counter = 1
            while any(d.slug == slug for d in dataset_objects):
                slug = f"{base_slug}-{counter}"
                counter += 1

            published_at = now - timedelta(days=30 - i)

            ds = Dataset(
                id=uuid.uuid4(),
                title=ds_data["title"],
                slug=slug,
                short_description=ds_data["short_description"],
                full_description=ds_data["full_description"],
                contributor_id=demo_user.id,
                category=ds_data["category"],
                tags=ds_data["tags"],
                source_url=ds_data["source_url"],
                download_url=ds_data.get("download_url"),
                file_format=ds_data["file_format"],
                licence=ds_data["licence"],
                language=ds_data["language"],
                collection_method=ds_data.get("collection_method"),
                intended_use=ds_data.get("intended_use"),
                known_limitations=ds_data.get("known_limitations"),
                citation_info=ds_data.get("citation_info"),
                status=DatasetStatus.approved,
                is_sample_data=True,
                num_records=ds_data.get("num_records"),
                num_columns=ds_data.get("num_columns"),
                file_size_bytes=ds_data.get("file_size_bytes"),
                quality_source=ds_data.get("quality_source"),
                geographic_coverage=ds_data.get("geographic_coverage"),
                version="1.0",
                view_count=max(0, 500 - i * 40),
                download_count=max(0, 100 - i * 8),
                published_at=published_at,
                created_at=published_at - timedelta(days=5),
                updated_at=published_at,
            )
            db.add(ds)
            dataset_objects.append(ds)
            print(f"  Created dataset [{i+1}/10]: {ds.title[:60]}")

        await db.flush()

        print("Seeding collections...")
        for col_data in SAMPLE_COLLECTIONS:
            dataset_ids = [
                str(dataset_objects[idx].id)
                for idx in col_data["dataset_indices"]
                if idx < len(dataset_objects)
            ]
            col = Collection(
                id=uuid.uuid4(),
                title=col_data["title"],
                slug=col_data["slug"],
                description=col_data["description"],
                curator_id=admin_user.id,
                is_featured=col_data["is_featured"],
                dataset_ids=dataset_ids,
                created_at=now,
                updated_at=now,
            )
            db.add(col)
            print(f"  Created collection: {col.title}")

        # Activity log entries for admin actions
        for ds in dataset_objects:
            log = ActivityLog(
                id=uuid.uuid4(),
                user_id=admin_user.id,
                action="dataset_approved",
                entity_type="dataset",
                entity_id=ds.id,
                metadata={"title": ds.title, "seeded": True},
                created_at=ds.published_at,
            )
            db.add(log)

        await db.commit()
        print("\nSeed complete!")
        print(f"  Admin login:       admin@thebuilderprotocol.me / TBPAdmin2026!")
        print(f"  Contributor login: demo@thebuilderprotocol.me  / Demo2026!")
        print(f"  Datasets created:  {len(dataset_objects)}")
        print(f"  Collections:       {len(SAMPLE_COLLECTIONS)}")


if __name__ == "__main__":
    asyncio.run(seed())
