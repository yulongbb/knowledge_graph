class WikidataEntity {
  final String id;
  final String label;

  WikidataEntity({required this.id, required this.label});

  factory WikidataEntity.fromJson(Map<String, dynamic> json) {
    return WikidataEntity(
      id: json['id'][0],
      label: json['label'][0],
    );
  }
}
