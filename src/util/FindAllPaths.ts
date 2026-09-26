import {CFG} from '../util/AllRooms';

export interface RoomNode {
	roomName: string;
	doorToGetHere: string|null;
	nextRoomNodes: RoomNode[];
}

function _findAllPaths(visited: Set<string>,
                       isChild: boolean,
                       isGlitchless: boolean,
                       roomToDoors: Record<string, string[]>,
                       doorToDoor: Record<string, string>,
                       doorToGetHere: string|null,
                       start: string,
                       end: string): RoomNode|null
{
	let roomNode: RoomNode|null = null;

	if (visited.has(start)) {
		return roomNode;  // We found the destination. Return
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

			// Skip this door if it's one-way and we're glitchless, or we're playing with glitches
			// and an exception isn't made for it
			if (CFG.one_way.includes(toDoorId)) {
				if (isGlitchless || !CFG.one_way_exception_glitches.includes(toDoorId)) {
					console.log(`Not considering ${toDoorId} because it's one way`);
					continue;
				}
			}

			// Skip is it's an adult-only route, we're a child, and we're glitchless
			// OR we are playing with glitches and an exception isn't made for it
			if (isChild && CFG.adult_only.includes(fromDoorId)) {
				if (isGlitchless || !CFG.child_only_exceptions_glitches.includes(fromDoorId)) {
					console.log(`Not considering ${fromDoorId} because it's adult-only`);
					continue;
				}
			}

			// Same as above check but reverse ages
			if (!isChild && CFG.child_only.includes(fromDoorId)) {
				if (isGlitchless || !CFG.adult_only_exceptions_glitches.includes(fromDoorId)) {
					console.log(`Not considering ${fromDoorId} because it's child-only`);
					continue;
				}
			}

			let nextRoom: RoomNode|null =
			    _findAllPaths(visited, isChild, isGlitchless, roomToDoors,
			                  doorToDoor, fromDoorId, idOfNextRoom, end);

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
                             isChild: boolean,
                             isGlitchless: boolean): RoomNode|null
{
	return _findAllPaths(new Set(), isChild, isGlitchless, roomToDoors, doorToDoor, null, start, end);
}


function _separatePathTree(node: RoomNode|null, roomList: string[]): string[][]
{
	if (node === null) {
		return [];
	}

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

export function separatePathTree(node: RoomNode|null): string[][]
{
	return _separatePathTree(node, []);
}
