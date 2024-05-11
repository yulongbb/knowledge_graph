import 'package:flutter/material.dart';

class CommentPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          TweetCard(
            username: 'ElonMusk',
            handle: '@ElonMusk',
            content: '很荣幸和李强总理会面。从上海初见至今，我们已相识多年。',
            time: '1h ago',
            likes: 20,
            comments: 10,
            retweets: 5,
          ),
        ],
      ),
    );
  }
}

class TweetCard extends StatelessWidget {
  final String username;
  final String handle;
  final String content;
  final String time;
  final int likes;
  final int comments;
  final int retweets;

  TweetCard({
    required this.username,
    required this.handle,
    required this.content,
    required this.time,
    required this.likes,
    required this.comments,
    required this.retweets,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage(
                      'http://localhost:9000/kgms/48088dfbf9b232e9ab52659fa8200da1.jpg'),
                ),
                SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      username,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      handle,
                      style: TextStyle(
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
                Spacer(),
                Text(
                  time,
                  style: TextStyle(
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              content,
              style: TextStyle(
                fontSize: 16,
              ),
            ),
            SizedBox(height: 8),
            Image.network(
              'http://localhost:9000/kgms/5c21f705b761ed7667ec8da7085a318d.jpg',
              height: 100,
            ),
            SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    IconButton(
                      icon: Icon(Icons.favorite_border),
                      onPressed: () {},
                    ),
                    Text('$likes'),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      icon: Icon(Icons.mode_comment_outlined),
                      onPressed: () {},
                    ),
                    Text('$comments'),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      icon: Icon(Icons.repeat),
                      onPressed: () {},
                    ),
                    Text('$retweets'),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
