import 'package:flutter/foundation.dart';
import 'package:storage_inspector/src/driver/storage_server.dart';
import 'package:storage_inspector/src/protocol/specific/generic.dart';
import 'package:storage_inspector/storage_inspector.dart';

class KeyValueProtocol {
  static const _commandGetAll = 'getAll';
  static const _commandGet = 'get';
  static const _commandClear = 'clear';
  static const _commandSet = 'set';
  static const _commandRemove = 'remove';
  static const _commandGetValue = 'get_value';

  final StorageProtocolServer _server;

  KeyValueProtocol(this._server);

  Future<Map<String, dynamic>> identify(
    KeyValueServer server,
  ) {
    return SynchronousFuture(<String, dynamic>{
      'type': 'identify',
      'data': {
        'id': server.id,
        'name': server.name,
        'icon': server.icon,
        'keySuggestions':
            server.keySuggestions.map(mapValueWithType).toList(growable: false),
        'keyOptions':
            server.keyOptions.map(mapValueWithType).toList(growable: false),
        'supportedKeyTypes':
            server.supportedKeyTypes.map(typeString).toList(growable: false),
        'supportedValueTypes':
            server.supportedValueTypes.map(typeString).toList(growable: false),
        'keyTypeHints': server.typeForKey.entries
            .map((entry) => {
                  'key': mapValueWithType(entry.key),
                  'type': typeString(entry.value),
                })
            .toList(growable: false),
        'keyIcons': server.keyIcons.entries
            .map((entry) => {
                  'key': mapValueWithType(entry.key),
                  'icon': entry.value,
                })
            .toList(growable: false),
      },
    });
  }

  Future<Map<String, dynamic>> onMessage(Map<String, dynamic> jsonData) {
    switch (jsonData['type']) {
      case _commandGetAll:
        return _handleGetAll();
      case _commandGet:
        return _handleGet(jsonData['data']['id'] as String);
      case _commandGetValue:
        return _handleGetValue(
            jsonData['data']['id'] as String, jsonData['data']['key']);
      case _commandClear:
        return _handleClear(jsonData['data']['id'] as String);
      case _commandSet:
        return _handleSet(jsonData['data']['id'] as String,
            jsonData['data']['key'], jsonData['data']['value']);
      case _commandRemove:
        return _handleRemove(
            jsonData['data']['id'] as String, jsonData['data']['key']);
      default:
        return Future.error(ArgumentError(
            'Unknown key-value protocol command: ${jsonData['type']}'));
    }
  }

  Future<Map<String, dynamic>> _handleGetAll() async {
    final returnData = <String, dynamic>{};

    final serverData = <Map<String, dynamic>>[];

    for (final element in _server.keyValueServers) {
      try {
        serverData.add(await _getAllFromServer(element));
      } catch (e) {
        storageInspectorLogger('Failed to get all from ${element.name}: $e');
      }
    }
    returnData['all'] = serverData;

    return returnData;
  }

  Future<Map<String, dynamic>> _getAllFromServer(KeyValueServer element) async {
    final allValues = await element.allValues;

    return <String, dynamic>{
      'id': element.id,
      'values': allValues
          .map(
            (e) => {
              'key': mapValueWithType(e.item1),
              'value': mapValueWithType(e.item2),
            },
          )
          .toList(growable: false),
    };
  }

  Future<Map<String, dynamic>> _handleGet(String id) async {
    final keyValueServer = _server.keyValueServers.firstWhere(
      (element) => element.id == id,
      orElse: () => throw ArgumentError('No server with id $id found'),
    );
    return await _getAllFromServer(keyValueServer);
  }

  Future<Map<String, dynamic>> _handleClear(String id) async {
    final keyValueServer = _server.keyValueServers.firstWhere(
      (element) => element.id == id,
      orElse: () => throw ArgumentError('No server with id $id found'),
    );
    await keyValueServer.clear();
    return <String, dynamic>{
      'id': id,
      'data': {
        'success': true,
      },
    };
  }

  Future<Map<String, dynamic>> _handleSet(
    String id,
    dynamic key,
    dynamic value,
  ) async {
    final keyData = decodeValueWithType(key);
    final valueData = decodeValueWithType(value);

    final keyValueServer = _server.keyValueServers.firstWhere(
      (element) => element.id == id,
      orElse: () => throw ArgumentError('No server with id $id found'),
    );

    await keyValueServer.set(keyData, valueData);
    return <String, dynamic>{
      'id': id,
      'data': {
        'success': true,
      },
    };
  }

  Future<Map<String, dynamic>> _handleGetValue(
    String id,
    dynamic key,
  ) async {
    final keyData = decodeValueWithType(key);

    final keyValueServer = _server.keyValueServers.firstWhere(
      (element) => element.id == id,
      orElse: () => throw ArgumentError('No server with id $id found'),
    );

    final value = await keyValueServer.get(keyData);
    return <String, dynamic>{
      'id': id,
      'data': {
        'value': mapValueWithType(value),
      },
    };
  }

  Future<Map<String, dynamic>> _handleRemove(
    String id,
    dynamic key,
  ) async {
    final keyData = decodeValueWithType(key);

    final keyValueServer = _server.keyValueServers.firstWhere(
      (element) => element.id == id,
      orElse: () => throw ArgumentError('No server with id $id found'),
    );

    await keyValueServer.remove(keyData);
    return <String, dynamic>{
      'id': id,
      'data': {
        'success': true,
      },
    };
  }
}
