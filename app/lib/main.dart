import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'search_bloc.dart';
import 'wikidata_entity.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Wikidata Search Demo',
      home: BlocProvider(
        create: (context) => SearchBloc(),
        child: MyHomePage(),
      ),
    );
  }
}

class MyHomePage extends StatelessWidget {
  final TextEditingController _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('知识检索'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _searchController,
              decoration: InputDecoration(labelText: '检索'),
            ),
            SizedBox(height: 16.0),
            ElevatedButton(
              onPressed: () {
                final query = _searchController.text;
                context.read<SearchBloc>().add(PerformSearchEvent(query));
              },
              child: Text('检索'),
            ),
            SizedBox(height: 16.0),
            BlocBuilder<SearchBloc, SearchState>(
              builder: (context, state) {
                if (state is SearchLoading) {
                  return CircularProgressIndicator();
                } else if (state is SearchSuccess) {
                  return Expanded(
                    child: ListView.builder(
                      itemCount: state.results.length,
                      itemBuilder: (context, index) {
                        final entity = state.results[index];
                        return ListTile(
                          title: Text(entity.label),
                          subtitle: Text(entity.id),
                        );
                      },
                    ),
                  );
                } else if (state is SearchError) {
                  return Text('Error: ${state.error}');
                } else {
                  return Container(); // Placeholder
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
