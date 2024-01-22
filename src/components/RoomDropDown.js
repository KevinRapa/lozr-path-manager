import {CFG} from '../AllRooms.js';
import {DropDown} from './DropDown.js';

interface RoomDropDownProps {
	name: string;
	rooms: string[];
	onChange: (selectedId: string) => void;
}

export function RoomDropDown(props: RoomDropDownProps)
{
	return (<>
		<span>{props.name}</span>
		<DropDown ids={props.rooms}
		          idToNameMap={CFG.areas}
		          onChange={props.onChange}
		/>
	</>);
}

