import React from 'react';
import {useState} from 'react';

export type LinkState = "ADULT"|"CHILD";

interface AdultChildButtonsProps {
	initialState: LinkState,
	onChange: (state: LinkState) => void
	className: string
}

export function AdultChildButtons(props: AdultChildButtonsProps)
{
	const [state, setState] = useState<LinkState>(props.initialState);

	const onChange = (e: any) => {
		setState(e.target.value);
		props.onChange(e.target.value);
	};

	const RadioButton = (props: { name: string }): JSX.Element => {
		return <label>
			{props.name}
			<input type="radio" name="time" value={props.name}
			       checked={state===props.name}
			       onChange={onChange}
			/>
		</label>
	}

	return <div className={props.className}>
		<RadioButton name={"CHILD"} />
		<RadioButton name={"ADULT"} />
	</div>
}
