import {CFG} from '../AllRooms.js';

export interface RoomNode {
	roomName: string;
	doorToGetHere: string|null;
	nextRoomNodes: RoomNode[];
}

function _findAllPaths(visited: Set<string>,
                       isChild: boolean,
                       roomToDoors: Record<string, string[]>,
                       doorToDoor: Record<string, string>,
                       doorToGetHere: string,
                       start: string,
                       end: string): RoomNode
{
	let roomNode: RoomNode|null = null;

	if (visited.has(start)) {
		return roomNode;
	}

	visited.add(start);

	if (start === end) {
		roomNode = {
			roomName: start,
			doorToGetHere: doorToGetHere,
			nextRoomNodes: []
		} as RoomNode;
	} else if (roomToDoors[start] !== undefined) {
		roomNode = {
			roomName: start,
			doorToGetHere: doorToGetHere,
			nextRoomNodes: []
		} as RoomNode;

		for (let fromDoorId of roomToDoors[start]) {
			let toDoorId: string = doorToDoor[fromDoorId];
			let idOfNextRoom: string = toDoorId.split('/')[0];

			if ((isChild && CFG.adult_only.includes(idOfNextRoom)) ||
			    (!isChild && CFG.child_only.includes(idOfNextRoom))) {
				continue;
			}

			let nextRoom: RoomNode =
			    _findAllPaths(visited, isChild, roomToDoors, doorToDoor,
			                  fromDoorId, idOfNextRoom, end);

			if (nextRoom !== null) {
				roomNode.nextRoomNodes.push(nextRoom);
			}
		}

		if (!roomNode.nextRoomNodes.length) {
			roomNode = null;
		}
	}

	visited.delete(start);
	return roomNode;
}

export function findAllPaths(roomToDoors: Record<string, string[]>,
                             doorToDoor: Record<string, string>,
                             start: string,
                             end: string,
                             isChild: boolean): RoomNode
{
	return _findAllPaths(new Set(), isChild, roomToDoors, doorToDoor, null, start, end);
}


function _separatePathTree(node: RoomNode, roomList: string[]): string[][]
{
	roomList.push(String(node.doorToGetHere) + "," + node.roomName);

	if (!node.nextRoomNodes.length) {
		return [roomList];
	}

	let roomListList: string[][] = [];

	for (let n of node.nextRoomNodes) {
		for (let newPath of _separatePathTree(n, [...roomList])) {
			roomListList.push(newPath);
		}
	}

	return roomListList;
}

export function separatePathTree(node: RoomNode): string[][]
{
	return _separatePathTree(node, []);
}
