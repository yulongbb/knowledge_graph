import 'package:flutter/material.dart';


class PersonPage extends StatelessWidget {
 @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Profile'),
      ),
      body: ListView(
        padding: EdgeInsets.all(16.0),
        children: [
          Center(
            child: CircleAvatar(
              radius: 50,
              backgroundImage: NetworkImage('https://path.to.image'), // Replace with actual image URL
            ),
          ),
          SizedBox(height: 16.0),
          Center(
            child: Text(
              '64 years',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ),
          Center(
            child: Text(
              'October 6, 1959',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
          SizedBox(height: 16.0),
          Center(
            child: Text(
              'People also search for',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          SizedBox(height: 8.0),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Column(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundImage: NetworkImage('https://path.to.image1'), // Replace with actual image URL
                  ),
                  SizedBox(height: 4.0),
                  Text('Ko Wen-je\n64 years', textAlign: TextAlign.center),
                ],
              ),
              Column(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundImage: NetworkImage('https://path.to.image2'), // Replace with actual image URL
                  ),
                  SizedBox(height: 4.0),
                  Text('Hou Yu-ih\n66 years', textAlign: TextAlign.center),
                ],
              ),
              Column(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundImage: NetworkImage('https://path.to.image3'), // Replace with actual image URL
                  ),
                  SizedBox(height: 4.0),
                  Text('Hsiao Bi-khim\n52 years', textAlign: TextAlign.center),
                ],
              ),
            ],
          ),
          SizedBox(height: 16.0),
          Center(
            child: Text(
              'Education',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          SizedBox(height: 8.0),
          Text(
            'National Cheng Kung University (1991), Taipei Municipal Jianguo High School (1979), National Taiwan University, Harvard University, Harvard University, Harvard T...',
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}