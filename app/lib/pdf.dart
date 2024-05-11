
import 'package:flutter/material.dart';
import 'package:webviewx/webviewx.dart';

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
  late WebViewXController webviewController;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return WebViewX(
      initialContent:
          'http://localhost:7777/web/viewer.html?file=/pdf/kgms/c4c3723bc6eb84bf4bf51ae8b6872fa0.pdf',
      initialSourceType: SourceType.url,
      onWebViewCreated: (controller) => webviewController = controller,
      height: 500,
      width: 1000,
    );
  }
}

