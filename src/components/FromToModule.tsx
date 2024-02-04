import React from 'react';
import {DropDown} from './DropDown';
import {useRef} from 'react';

interface FromToModuleProps {
	idToNameMapFrom: Record<string, string>
	idToNameMapTo: Record<string, string>
	onClick: (fromLoc: string, toLoc: string) => void
	buttonTitle: string
}

export function FromToModule(props: FromToModuleProps)
{
	const fromLoc = useRef<string|null>(null);
	const toLoc = useRef<string|null>(null);

	const fromChange = (entry: string) => {
		fromLoc.current = entry;
	};
	const toChange = (entry: string) => {
		toLoc.current = entry;
	};
	const onClick = () => {
		console.log(`FromToModule ${props.buttonTitle}, clicked \"${fromLoc.current}\" => \"${toLoc.current}\"`);

		if (fromLoc.current && toLoc.current) {
			props.onClick(fromLoc.current, toLoc.current);
			fromLoc.current = null;
			toLoc.current = null;
		} else {
			console.log("Cannot do");
		}
	};

	return <>
		<span>{"From:"}</span>
		<DropDown idToNameMap={props.idToNameMapFrom}
		          onChange={fromChange}
		/>
		<span>{"To:"}</span>
		<DropDown idToNameMap={props.idToNameMapTo}
		          onChange={toChange}
		/>
		<button onClick={onClick}>
			{props.buttonTitle}
		</button>
	</>;
}
