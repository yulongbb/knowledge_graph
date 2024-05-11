import 'package:app/pdf.dart';
import 'package:app/person.dart';
import 'package:app/video.dart';
import 'package:english_words/english_words.dart';
import 'package:flutter/material.dart';

import 'audio.dart';
import 'comment.dart';
import 'image.dart';
import 'organization.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // Try running your application with "flutter run". You'll see the
        // application has a blue toolbar. Then, without quitting the app, try
        // changing the primarySwatch below to Colors.green and then invoke
        // "hot reload" (press "r" in the console where you ran "flutter run",
        // or simply save your changes to "hot reload" in a Flutter IDE).
        // Notice that the counter didn't reset back to zero; the application
        // is not restarted.
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);
  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  var selectedIndex = 0;
  var favorites = <WordPair>[];
  var current = WordPair.random();
  late Widget page;

  @override
  void initState() {
    switch (selectedIndex) {
      case 0:
        page = PersonPage();
        break;
      case 1:
        page = OrganizationPage();
        break;
      case 2:
        page = CommentPage();
        break;
      case 3:
        page = PDFsPage();
        break;
      case 4:
        page = ImagesPage();
        break;
      case 5:
        page = AudiosPage();
        break;
      case 6:
        page = VideosPage();
        break;
      default:
        throw UnimplementedError('no widget for $selectedIndex');
    }
    super.initState();
  }

  final List<String> tabs = [
    '人物',
    '组织',
    '评论',
    'PDF',
    '图像',
    '音频',
    '视频',
  ];
  void _handleTabTap(int index) {
    setState(() {
      selectedIndex = index;
      switch (selectedIndex) {
        case 0:
          page = PersonPage();
          break;
        case 1:
          page = OrganizationPage();
          break;
        case 2:
          page = CommentPage();
          break;
        case 3:
          page = PDFsPage();
          break;
        case 4:
          page = ImagesPage();
          break;
        case 5:
          page = AudiosPage();
          break;
        case 6:
          page = VideosPage();
          break;
        default:
          throw UnimplementedError('no widget for $selectedIndex');
      }
    });
    // Do something with the selected index, like navigating to a specific page
    print('Selected tab index: $selectedIndex');
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      if (constraints.maxWidth >= 600) {
        return Scaffold(
          body: Row(
            children: [
              SafeArea(
                child: NavigationRail(
                  extended: constraints.maxWidth >= 600, // ← Here.
                  destinations: [
                    NavigationRailDestination(
                      icon: Icon(Icons.person),
                      label: Text('人物'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.group),
                      label: Text('组织'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.comment),
                      label: Text('评论'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.picture_as_pdf),
                      label: Text('PDF'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.picture_in_picture),
                      label: Text('图像'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.audiotrack),
                      label: Text('音频'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.video_call),
                      label: Text('视频'),
                    ),
                  ],
                  selectedIndex: selectedIndex, // ← Change to this.
                  onDestinationSelected: (value) {
                    // ↓ Replace print with this.
                    setState(() {
                      selectedIndex = value;
                      switch (selectedIndex) {
                        case 0:
                          page = PersonPage();
                          break;
                        case 1:
                          page = OrganizationPage();
                          break;
                        case 2:
                          page = CommentPage();
                          break;
                        case 3:
                          page = PDFsPage();
                          break;
                        case 4:
                          page = ImagesPage();
                          break;
                        case 5:
                          page = AudiosPage();
                          break;
                        case 6:
                          page = VideosPage();
                          break;
                        default:
                          throw UnimplementedError(
                              'no widget for $selectedIndex');
                      }
                    });
                  },
                ),
              ),
              Expanded(
                child: Container(
                  child: page,
                ),
              ),
            ],
          ),
        );
      } else {
        return Scaffold(
          body: DefaultTabController(
            length: tabs.length,
            child: NestedScrollView(
              headerSliverBuilder: (context, _) {
                return [
                  SliverAppBar(
                    title: Text('知识图谱'),
                    floating: true,
                    pinned:
                        false, // Set pinned to false to place the app bar at the top of the page
                    bottom: TabBar(
                      isScrollable: true,
                      tabs: tabs.map((tab) => Tab(text: tab)).toList(),
                      onTap: _handleTabTap,
                    ),
                  ),
                ];
              },
              body: TabBarView(
                children: [
                  PersonPage(),
                   OrganizationPage(),
                   CommentPage(),
                   PDFsPage(),
                   ImagesPage(),
                   AudiosPage(),
                   VideosPage()
                ],
              ),
            ),
          ),
        );
      }
    });
  }
}

class GeneratorPage extends StatefulWidget {
  List<WordPair> favorites;
  WordPair current;
  GeneratorPage({Key? key, required this.favorites, required this.current})
      : super(key: key);

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<GeneratorPage> createState() => _GeneratorPageState();
}

class _GeneratorPageState extends State<GeneratorPage> {
  IconData icon = Icons.favorite;

  @override
  void initState() {
    if (widget.favorites.contains(widget.current)) {
      icon = Icons.favorite;
    } else {
      icon = Icons.favorite_border;
    }
    super.initState();
  }

  void getNext() {
    setState(() {
      widget.current = WordPair.random();
      if (widget.favorites.contains(widget.current)) {
        icon = Icons.favorite;
      } else {
        icon = Icons.favorite_border;
      }
    });
  }

  void toggleFavorite() {
    setState(() {
      if (widget.favorites.contains(widget.current)) {
        widget.favorites.remove(widget.current);
      } else {
        widget.favorites.add(widget.current);
      }
      if (widget.favorites.contains(widget.current)) {
        icon = Icons.favorite;
      } else {
        icon = Icons.favorite_border;
      }
    });
  }

  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            BigCard(
              pair: widget.current,
            ),
            SizedBox(
              height: 10,
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    toggleFavorite();
                  },
                  icon: Icon(icon),
                  label: Text('Like'),
                ),
                SizedBox(width: 10),
                ElevatedButton(
                  onPressed: () {
                    getNext();
                  },
                  child: Text('Next'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class BigCard extends StatelessWidget {
  const BigCard({
    required this.pair,
  });

  final WordPair pair;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context); // ← Add this.
    final style = theme.textTheme.headline1!.copyWith(
      color: theme.colorScheme.onPrimary,
    );
    return Card(
      color: theme.colorScheme.primary, // ← And also this.
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Text(
          pair.asLowerCase,
          style: style,
          semanticsLabel: "${pair.first} ${pair.second}",
        ),
      ),
    );
    ;
  }
}

class FavoritesPage extends StatefulWidget {
  final List<WordPair> favorites;
  const FavoritesPage({Key? key, required this.favorites}) : super(key: key);
  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<FavoritesPage> createState() => _FavoritesPageState();
}

class _FavoritesPageState extends State<FavoritesPage> {
  @override
  Widget build(BuildContext context) {
    if (widget.favorites.isEmpty) {
      return Center(
        child: Text('No favorites yet.'),
      );
    }

    return ListView(
      children: [
        Padding(
          padding: const EdgeInsets.all(20),
          child: Text('You have '
              '${widget.favorites.length} favorites:'),
        ),
        for (var pair in widget.favorites)
          ListTile(
            leading: Icon(Icons.favorite),
            title: Text(pair.asLowerCase),
          ),
      ],
    );
  }
}
