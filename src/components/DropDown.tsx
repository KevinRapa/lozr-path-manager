import {useEffect,useState} from 'react';
import Select from 'react-select';

import './DropDown.css';

interface DropDownProps {
	idToNameMap: Record<string, string>;
	onChange: (selectedId: string) => void;
	title: string;
	className: string;
}

function convertToSortedPairs(idToNameMap: Record<string, string>): [string, string][]
{
	return Object.entries(idToNameMap)
	             .sort((p1: [string, string], p2: [string, string]): number => {
	                 return p1[1].localeCompare(p2[1]);
	             });
}

export function DropDown(props: DropDownProps)
{
	const [currentSelection, setCurrentSelection] = useState<string>("");

	useEffect(() => {
		props.onChange(currentSelection);
	}, [currentSelection]);

	useEffect(() => {
		setCurrentSelection("");
	}, [props.idToNameMap]);

	const options = convertToSortedPairs(props.idToNameMap)
	    .map((s: [string, string]) => ({ value: s[0], label: s[1] }));

	return <div className={props.className + " dropdown-container"}>
		<span className="dropdown-title">{props.title}</span>
		<Select
		    className="dropdown"
		    onChange={setCurrentSelection as any}
		    isSearchable={true}
		    value={currentSelection}
		    placeholder={"Make a selection..."}
		    options={options as any}
		/>
	</div>
}

