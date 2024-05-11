import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

import 'api.dart';

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
  late PageController _pageController;
  List<String> videoUrls = [];
  int currentPage = 0;

  Api api = Api('http://localhost:3000');
  List nodes = [];
  Map<String, String> condition = {
    "collection": "video_entity",
    "type": "视频",
    "keyword": "%%"
  };

  void getNodes(condition) async {
    api.getNodes(condition).then((value) => {
          setState(() {
            print(value);
            nodes = value['list'];
            for (var element in nodes) {
              videoUrls.add(
                  'http://localhost:9000/kgms/${element['label'][0].toString()}');
            }
          })
        });
  }

  @override
  void initState() {
    _pageController = PageController();
    _pageController.addListener(() {
      int nextPage = _pageController.page!.round();
      if (currentPage != nextPage) {
        setState(() {
          currentPage = nextPage;
        });
      }
    });
    getNodes(condition);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView.builder(
        controller: _pageController,
        itemCount: videoUrls.length,
        scrollDirection: Axis.vertical,
        itemBuilder: (BuildContext context, int index) {
          return VideoPlayerWidget(videoUrl: videoUrls[index]);
        },
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
    _pageController.dispose();
  }
}

class VideoPlayerWidget extends StatefulWidget {
  final String videoUrl;

  const VideoPlayerWidget({Key? key, required this.videoUrl}) : super(key: key);

  @override
  _VideoPlayerWidgetState createState() => _VideoPlayerWidgetState();
}

class _VideoPlayerWidgetState extends State<VideoPlayerWidget> {
  late VideoPlayerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.network(widget.videoUrl)
      ..initialize().then((_) {
        setState(() {});
      });
    _controller.setLooping(true); // 循环播放视频
    _controller.play(); // 自动播放视频
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        AspectRatio(
          aspectRatio: _controller.value.aspectRatio,
          child: _controller.value.isInitialized
              ? VideoPlayer(_controller)
              : Container(),
        ),
      ],
    );
  }

  @override
  void dispose() {
    super.dispose();
    _controller.dispose();
  }
}
