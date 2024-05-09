import 'dart:async';

import 'package:english_words/english_words.dart';
import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';
// import 'package:audioplayers/audioplayers.dart';
import 'package:video_player/video_player.dart';

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

  // late AudioPlayer player = AudioPlayer();

  // @override
  // void dispose() {
  //   // Release all sources and dispose the player.
  //   player.dispose();

  //   super.dispose();
  // }

  @override
  void initState() {
    // Create the audio player.
    // player = AudioPlayer();

    // // Set the release mode to keep the source after playback has completed.
    // player.setReleaseMode(ReleaseMode.stop);

    // // Start the player as soon as the app is displayed.
    // WidgetsBinding.instance?.addPostFrameCallback((_) async {
    //   await player.setSource(UrlSource(
    //       'http://localhost:9000/kgms/54dac35d8f546310ced8ecf0e79507ed.mp3'));
    //   await player.resume();
    // });
    switch (selectedIndex) {
      case 0:
        page = PeoplePage();
        break;
      case 1:
        page = FavoritesPage(favorites: favorites);
        break;
      case 3:
        page = PDFsPage();
        break;
      // case 4:
      //   page = ImagesPage();
      //   break;
      // case 5:
      //   page = AudiosPage(player: player);
      //   break;
      case 6:
        page = VideosPage();
        break;
      default:
        throw UnimplementedError('no widget for $selectedIndex');
    }
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
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
                        page = PeoplePage();
                        break;
                      case 1:
                        page = FavoritesPage(favorites: favorites);
                        break;
                      case 3:
                        page = PDFsPage();
                        break;
                      case 4:
                        page = ImagesPage();
                        break;
                      // case 5:
                      //   page = AudiosPage(player: player);
                      //   break;
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

class PeoplePage extends StatefulWidget {
  PeoplePage({
    Key? key,
  }) : super(key: key);
  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<PeoplePage> createState() => _PeoplePageState();
}

class _PeoplePageState extends State<PeoplePage> {
  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        Padding(padding: const EdgeInsets.all(20), child: Text('人物')),
      ],
    );
  }
}

class PDFsPage extends StatefulWidget {
  PDFsPage({Key? key}) : super(key: key);
  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<PDFsPage> createState() => _PDFsPageState();
}

class _PDFsPageState extends State<PDFsPage> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text('pdf')
      // PDFView(
      //   filePath:'http://localhost:7777/web/viewer.html?file=/pdf/kgms/c4c3723bc6eb84bf4bf51ae8b6872fa0.pdf',
      // ),// WebView
    );
  }
}

class ImagesPage extends StatefulWidget {
  ImagesPage({Key? key}) : super(key: key);
  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<ImagesPage> createState() => _ImagesPageState();
}

class _ImagesPageState extends State<ImagesPage> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
        child: 
        PhotoView(
      imageProvider: NetworkImage(
          'http://192.168.31.87:9000/kgms/782a4b8867611f842e5c9ceb010c0d08.jpg'),
    )
    );
  }
}

// class AudiosPage extends StatefulWidget {
//   final AudioPlayer player;

//   AudiosPage({Key? key, required this.player}) : super(key: key);
//   // This widget is the home page of your application. It is stateful, meaning
//   // that it has a State object (defined below) that contains fields that affect
//   // how it looks.

//   // This class is the configuration for the state. It holds the values (in this
//   // case the title) provided by the parent (in this case the App widget) and
//   // used by the build method of the State. Fields in a Widget subclass are
//   // always marked "final".

//   @override
//   State<AudiosPage> createState() => _AudiosPageState();
// }

// class _AudiosPageState extends State<AudiosPage> {
//   PlayerState? _playerState;
//   Duration? _duration;
//   Duration? _position;

//   StreamSubscription? _durationSubscription;
//   StreamSubscription? _positionSubscription;
//   StreamSubscription? _playerCompleteSubscription;
//   StreamSubscription? _playerStateChangeSubscription;

//   bool get _isPlaying => _playerState == PlayerState.playing;

//   bool get _isPaused => _playerState == PlayerState.paused;

//   String get _durationText => _duration?.toString().split('.').first ?? '';

//   String get _positionText => _position?.toString().split('.').first ?? '';

//   AudioPlayer get player => widget.player;

//   @override
//   void initState() {
//     super.initState();
//     // Use initial values from player
//     _playerState = player.state;
//     player.getDuration().then(
//           (value) => setState(() {
//             _duration = value;
//           }),
//         );
//     player.getCurrentPosition().then(
//           (value) => setState(() {
//             _position = value;
//           }),
//         );
//     _initStreams();
//   }

//   @override
//   void setState(VoidCallback fn) {
//     // Subscriptions only can be closed asynchronously,
//     // therefore events can occur after widget has been disposed.
//     if (mounted) {
//       super.setState(fn);
//     }
//   }

//   @override
//   void dispose() {
//     _durationSubscription?.cancel();
//     _positionSubscription?.cancel();
//     _playerCompleteSubscription?.cancel();
//     _playerStateChangeSubscription?.cancel();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     final color = Theme.of(context).primaryColor;
//     return Column(
//       mainAxisSize: MainAxisSize.min,
//       children: <Widget>[
//         Row(
//           mainAxisSize: MainAxisSize.min,
//           children: [
//             IconButton(
//               key: const Key('play_button'),
//               onPressed: _isPlaying ? null : _play,
//               iconSize: 48.0,
//               icon: const Icon(Icons.play_arrow),
//               color: color,
//             ),
//             IconButton(
//               key: const Key('pause_button'),
//               onPressed: _isPlaying ? _pause : null,
//               iconSize: 48.0,
//               icon: const Icon(Icons.pause),
//               color: color,
//             ),
//             IconButton(
//               key: const Key('stop_button'),
//               onPressed: _isPlaying || _isPaused ? _stop : null,
//               iconSize: 48.0,
//               icon: const Icon(Icons.stop),
//               color: color,
//             ),
//           ],
//         ),
//         Slider(
//           onChanged: (value) {
//             final duration = _duration;
//             if (duration == null) {
//               return;
//             }
//             final position = value * duration.inMilliseconds;
//             player.seek(Duration(milliseconds: position.round()));
//           },
//           value: (_position != null &&
//                   _duration != null &&
//                   _position!.inMilliseconds > 0 &&
//                   _position!.inMilliseconds < _duration!.inMilliseconds)
//               ? _position!.inMilliseconds / _duration!.inMilliseconds
//               : 0.0,
//         ),
//         Text(
//           _position != null
//               ? '$_positionText / $_durationText'
//               : _duration != null
//                   ? _durationText
//                   : '',
//           style: const TextStyle(fontSize: 16.0),
//         ),
//       ],
//     );
//   }

//   void _initStreams() {
//     _durationSubscription = player.onDurationChanged.listen((duration) {
//       setState(() => _duration = duration);
//     });

//     _positionSubscription = player.onPositionChanged.listen(
//       (p) => setState(() => _position = p),
//     );

//     _playerCompleteSubscription = player.onPlayerComplete.listen((event) {
//       setState(() {
//         _playerState = PlayerState.stopped;
//         _position = Duration.zero;
//       });
//     });

//     _playerStateChangeSubscription =
//         player.onPlayerStateChanged.listen((state) {
//       setState(() {
//         _playerState = state;
//       });
//     });
//   }

//   Future<void> _play() async {
//     await player.resume();
//     setState(() => _playerState = PlayerState.playing);
//   }

//   Future<void> _pause() async {
//     await player.pause();
//     setState(() => _playerState = PlayerState.paused);
//   }

//   Future<void> _stop() async {
//     await player.stop();
//     setState(() {
//       _playerState = PlayerState.stopped;
//       _position = Duration.zero;
//     });
//   }
// }

class VideosPage extends StatefulWidget {
  VideosPage({Key? key}) : super(key: key);
  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<VideosPage> createState() => _VideosPageState();
}

class _VideosPageState extends State<VideosPage> {
  late VideoPlayerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.network(
        'http://192.168.31.87:9000/kgms/f64def7655d66e4edd738345d3a98b19.mp4')
      ..initialize().then((_) {
        // Ensure the first frame is shown after the video is initialized, even before the play button has been pressed.
        setState(() {});
      });
    _controller.setLooping(true); // 循环播放视频
    _controller.play(); // 自动播放视频
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Video Demo',
      home: Scaffold(
        resizeToAvoidBottomInset: false,
        body: Center(
          child: _controller.value.isInitialized
              ? AspectRatio(
                  aspectRatio: _controller.value.aspectRatio,
                  child: VideoPlayer(_controller),
                )
              : CircularProgressIndicator(),
        ),
        // floatingActionButton: FloatingActionButton(
        //   onPressed: () {
        //     setState(() {
        //       _controller.value.isPlaying
        //           ? _controller.pause()
        //           : _controller.play();
        //     });
        //   },
        //   child: Icon(
        //     _controller.value.isPlaying ? Icons.pause : Icons.play_arrow,
        //   ),
        // ),
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
    _controller.dispose();
  }
}
