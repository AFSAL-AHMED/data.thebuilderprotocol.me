def format_citation_apa(dataset) -> str:
    """Generate an APA-style citation for a dataset."""
    contributor_name = getattr(dataset, "contributor_name", "Unknown Author")
    year = dataset.published_at.year if dataset.published_at else dataset.created_at.year
    title = dataset.title
    source = dataset.source_url
    version = dataset.version
    return f'{contributor_name} ({year}). {title} (Version {version}) [Dataset]. {source}'


def format_citation_bibtex(dataset) -> str:
    """Generate a BibTeX-style citation for a dataset."""
    contributor_name = getattr(dataset, "contributor_name", "Unknown")
    year = dataset.published_at.year if dataset.published_at else dataset.created_at.year
    key = f"{contributor_name.split()[0].lower()}{year}{dataset.slug[:10]}"
    return (
        f"@dataset{{{key},\n"
        f"  title = {{{dataset.title}}},\n"
        f"  author = {{{contributor_name}}},\n"
        f"  year = {{{year}}},\n"
        f"  url = {{{dataset.source_url}}},\n"
        f"  version = {{{dataset.version}}}\n"
        f"}}"
    )


def get_all_citation_formats(dataset) -> dict:
    return {
        "apa": format_citation_apa(dataset),
        "bibtex": format_citation_bibtex(dataset),
        "custom": dataset.citation_info or "",
    }
