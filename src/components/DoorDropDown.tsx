import {CFG} from '../AllRooms.js';
import {DropDown} from './DropDown.tsx';

interface DoorDropDownProps {
	name: string;
	doors: string[];
	onChange: (selectedId: string) => void;
}

export function DoorDropDown(props: DoorDropDownProps)
{
	return (<>
		<span>{props.name}</span>
		<DropDown ids={props.doors}
		          idToNameMap={CFG.doors}
		          onChange={props.onChange}
		/>
	</>);
}

