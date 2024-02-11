import React from 'react';
import {useEffect,useState} from 'react';

interface DropDownProps {
	idToNameMap: Record<string, string>;
	onChange: (selectedId: string) => void;
	title: string;
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
	const [currentSelection, setCurrentSelection] = useState<string>("");

	useEffect(() => {
		props.onChange(currentSelection);
	}, [currentSelection]);

	return <>
		<span>{props.title}</span>
		<select onChange={e => setCurrentSelection(e.target.value)}>
			<option key="" value="">{"Make a selection..."}</option>
			{
				convertIdsToIdNamePairs(props.idToNameMap).map((s: [string, string]): JSX.Element => {
					return <option key={s[0]} value={s[0]}>{s[1]}</option>;
				})
			}
		</select>
	</>
}

