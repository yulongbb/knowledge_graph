import 'package:flutter/material.dart';

class OrganizationPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Organization Card'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Wrap(
          spacing: 16.0,
          runSpacing: 16.0,
          children: [
            Expanded(
              child: OrganizationInfoCard(
                name: 'ABC Corporation',
                imageUrl: 'assets/organization_logo.jpg',
                basicInfo: {
                  'Industry': 'Technology',
                  'Location': 'San Francisco, USA',
                  'Founded': '2000',
                  'CEO': 'Jane Smith',
                },
              ),
            ),
            Expanded(
              child: ServicesCard(
                services: [
                  'Software Development',
                  'Cloud Computing',
                ],
              ),
            ),
            Expanded(
              child: ProjectsCard(
                projects: [
                  'Project A',
                  'Project B',
                ],
              ),
            ),
            Expanded(
              child: ContactInfoCard(
                contactInfo: {
                  'Email': 'info@abccorp.com',
                  'Phone': '+1 123-456-7890',
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OrganizationInfoCard extends StatelessWidget {
  final String name;
  final String imageUrl;
  final Map<String, String> basicInfo;

  OrganizationInfoCard({
    required this.name,
    required this.imageUrl,
    required this.basicInfo,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 40,
              backgroundImage: AssetImage(imageUrl),
            ),
            SizedBox(height: 16),
            Text(
              name,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: basicInfo.entries.map((entry) {
                return Text(
                  '${entry.key}: ${entry.value}',
                  style: TextStyle(
                    color: Colors.grey,
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class ServicesCard extends StatelessWidget {
  final List<String> services;

  ServicesCard({
    required this.services,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Services',
              style: TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: services.map((service) {
                return Text(
                  '• $service',
                  style: TextStyle(
                    color: Colors.grey,
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class ProjectsCard extends StatelessWidget {
  final List<String> projects;

  ProjectsCard({
    required this.projects,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Projects',
              style: TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: projects.map((project) {
                return Text(
                  '• $project',
                  style: TextStyle(
                    color: Colors.grey,
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class ContactInfoCard extends StatelessWidget {
  final Map<String, String> contactInfo;

  ContactInfoCard({
    required this.contactInfo,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Contact Information',
              style: TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: contactInfo.entries.map((entry) {
                return Padding(
                  padding: EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Text(
                        entry.key + ': ',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(entry.value),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
