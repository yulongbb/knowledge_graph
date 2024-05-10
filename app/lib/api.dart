import 'dart:convert';

import 'package:http/http.dart' as http;

class Api {
  final String baseUrl;

  Api(this.baseUrl);

  Future<Map<String, dynamic>> getNodes(condition) async {
    final body = jsonEncode(
       condition);

    final response = await http.post(Uri.parse('$baseUrl/api/node/20/1'),
        headers: {
          "token":
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ4YzU1NjEzLTUwNDItMGZlOS05YzlhLTE3NDM4MjIxMjVlZSIsImlhdCI6MTcxNTMwNzI0MywiZXhwIjoxNzE1MzEwODQzfQ.kqpEzL1YIYYtkLLcySozyLlnJT0-ldAMUpWlhqCX8Lw",
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: body);
    print(response.statusCode);
    return json.decode(const Utf8Decoder().convert(response.bodyBytes));
  }
}
