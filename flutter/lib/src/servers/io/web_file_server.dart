import 'dart:typed_data';

import 'package:storage_inspector/src/servers/file_server.dart';
import 'package:uuid/uuid.dart';

/// Faked web file server that serves empty directory.
/// All methods result in either empty responses or
/// errors
class DefaultFileServer implements FileServer {
  @override
  final String? icon;

  @override
  final String name;

  @override
  final String id = const Uuid().v4();

  DefaultFileServer(
    String root,
    this.name, {
    this.icon,
  });

  @override
  Future<List<FileInfo>> browse(String root) => Future.value(List.empty());

  @override
  Future<void> delete(String path, {required bool recursive}) =>
      Future.error(ArgumentError('Not supported on web'));

  @override
  Future<Uint8List> read(String path) =>
      Future.error(ArgumentError('Not supported on web'));

  @override
  Future<void> write(String path, Uint8List data) =>
      Future.error(ArgumentError('Not supported on web'));

  @override
  Future<void> move({required String path, required String newPath}) =>
      Future.error(ArgumentError('Not supported on web'));
}
