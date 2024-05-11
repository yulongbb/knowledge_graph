import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';

import 'api.dart';

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
  Api api = Api('http://localhost:3000');
  List nodes = [];
  Map<String, String> condition = {
    "collection": "image_entity",
    "type": "图像",
    "keyword": "%%"
  };
  @override
  void initState() {
    getNodes(condition);
    super.initState();
  }

  void getNodes(condition) async {
    api.getNodes(condition).then((value) => {
          setState(() {
            print(value);
            nodes = value['list'];
          })
        });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
        child: PhotoViewGallery.builder(
      scrollPhysics: const BouncingScrollPhysics(),
      scrollDirection: Axis.vertical,
      builder: (BuildContext context, int index) {
        return PhotoViewGalleryPageOptions(
          imageProvider: NetworkImage(
              'http://localhost:9000/kgms/${nodes[index]['label'][0].toString()}'),
          initialScale: PhotoViewComputedScale.contained * 0.8,
          heroAttributes:
              PhotoViewHeroAttributes(tag: nodes[0]['id'][0].toString()),
        );
      },
      itemCount: nodes.length,
      backgroundDecoration: BoxDecoration(
        color: Colors.white,
      ),
      pageController: PageController(),
    ));

    // PhotoView(
    //     imageProvider:
    //         NetworkImage('http://localhost:9000/kgms/46bd92afdfb1d82728b2128f327b0482.png'),
    //   );
  }
}
