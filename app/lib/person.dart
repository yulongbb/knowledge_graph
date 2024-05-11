import 'package:flutter/material.dart';


class PersonPage extends StatelessWidget {
 @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Person Card'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Wrap(
          spacing: 16.0,
          runSpacing: 16.0,
          children: [
            Expanded(
              child: PersonInfoCard(
                name: 'John Doe',
                imageUrl: 'assets/person_avatar.jpg',
                basicInfo: {
                  'Date of Birth': 'January 1, 1980',
                  'Place of Birth': 'New York, USA',
                  'Nationality': 'American',
                  'Occupation': 'CEO',
                },
              ),
            ),
            Expanded(
              child: EducationCard(
                education: [
                  'Harvard University',
                  'Stanford University',
                ],
              ),
            ),
            Expanded(
              child: ExperienceCard(
                experience: [
                  'CEO at XYZ Inc.',
                  'VP of Engineering at ABC Corp.',
                ],
              ),
            ),
            Expanded(
              child: SocialAccountsCard(
                socialAccounts: {
                  'Twitter': '@johndoe',
                  'LinkedIn': 'linkedin.com/in/johndoe',
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PersonInfoCard extends StatelessWidget {
  final String name;
  final String imageUrl;
  final Map<String, String> basicInfo;

  PersonInfoCard({
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

class EducationCard extends StatelessWidget {
  final List<String> education;

  EducationCard({
    required this.education,
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
              'Education',
              style: TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: education.map((item) {
                return Text(
                  '• $item',
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

class ExperienceCard extends StatelessWidget {
  final List<String> experience;

  ExperienceCard({
    required this.experience,
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
              'Experience',
              style: TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: experience.map((item) {
                return Text(
                  '• $item',
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

class SocialAccountsCard extends StatelessWidget {
  final Map<String, String> socialAccounts;

  SocialAccountsCard({
    required this.socialAccounts,
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
              'Social Accounts',
              style: TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: socialAccounts.entries.map((entry) {
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