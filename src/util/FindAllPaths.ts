
export interface RoomNode {
	roomName: string;
	nextRoomNodes: RoomNode[];
}

export function findAllPaths(visited: Set<string>,
                      roomToDoors: Record<string, string[]>,
                      doorToDoor: Record<string, string>,
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
			nextRoomNodes: []
		};
	} else if (roomToDoors[start] !== undefined) {
		roomNode = {
			roomNode: start,
			nextRoomNodes: []
		};

		for (let fromDoorId of roomToDoors[start]) {
			let toDoorId: string = doorToDoor[fromDoorId];
			let idOfNextRoom: string = toDoorId.split('/')[0];

			let nextRoom: RoomNode =
			    findAllPaths(visited, roomToDoors, doorToDoor,
			                 idOfNextRoom, end);

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

