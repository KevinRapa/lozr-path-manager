import React from 'react';
import {useEffect,useState} from 'react';

interface DropDownProps {
	idToNameMap: Record<string, string>;
	onChange: (selectedId: string) => void;
}

function convertIdsToIdNamePairs(idToNameMap: Record<string, string>): [string, string][]
{
	return Object.entries(idToNameMap)
	             .sort((p1: [string, string], p2: [string, string]): number => {
	                 return p1[1].localeCompare(p2[1]);
	             });
}

export function DropDown(props: DropDownProps)
{
	const [currentSelection,setCurrentSelection] = useState<string>("");

	useEffect(() => {
		if (currentSelection.length) {
			console.log(`Clicked ${currentSelection}`);
			props.onChange(currentSelection);
		}
	}, [currentSelection]);

	let dropDownElems: [string, string][] = convertIdsToIdNamePairs(props.idToNameMap);

	return <select onChange={e => setCurrentSelection(e.target.value)}>
		<option key="" value="">{"Make a selection..."}</option>
		{
			dropDownElems.map((s: [string, string]): JSX.Element => {
				return <option key={s[0]} value={s[0]}>{s[1]}</option>;
			})
		}
	</select>;
}

