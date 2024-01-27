import 'package:app/wikidata_entity.dart';
import 'package:bloc/bloc.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

// Events
abstract class SearchEvent {}

class PerformSearchEvent extends SearchEvent {
  final String query;

  PerformSearchEvent(this.query);
}

// States
abstract class SearchState {}

class SearchInitial extends SearchState {}

class SearchLoading extends SearchState {}

class SearchSuccess extends SearchState {
  final List<WikidataEntity> results;

  SearchSuccess(this.results);
}

class SearchError extends SearchState {
  final String error;

  SearchError(this.error);
}

// BLoC
class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc() : super(SearchInitial()); // Add this line


  @override
  SearchState get initialState => SearchInitial();

  @override
  Stream<SearchState> mapEventToState(SearchEvent event) async* {
    if (event is PerformSearchEvent) {
      yield SearchLoading();

      try {
        final results = await _performSearch(event.query);
        yield SearchSuccess(results);
      } catch (e) {
        yield SearchError('Error performing search');
      }
    }
  }

  Future<List<WikidataEntity>> _performSearch(String query) async {
    final apiUrl = 'http://192.168.31.87:3000/api/fusion/20/1';
    final response = await http.post(Uri.parse(apiUrl), body: {'keyword':'%${query}%'});

    if (response.statusCode == 201) {
      final Map<String, dynamic> data = json.decode(response.body);
      final List<dynamic> searchResults = data['list'];

      return searchResults.map((result) => WikidataEntity.fromJson(result)).toList();
    } else {
      throw Exception('Failed to load search results');
    }
  }
}
