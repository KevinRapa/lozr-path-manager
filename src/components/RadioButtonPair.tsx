import React from 'react';
import {useState} from 'react';

interface RadioButtonPairProps<T extends string> {
	vals: [T, T],
	onChange: (state: T) => void
	className: string
}

export function RadioButtonPair<T extends string>(props: RadioButtonPairProps<T>)
{
	const [state, setState] = useState<T>(props.vals[0]);

	const onChange = (e: any) => {
		setState(e.target.value);
		props.onChange(e.target.value);
	};

	const RadioButton = (props: { val: T, name: string }): JSX.Element => {
		return <label>
			{props.val}
			<input type="radio" name={props.name} value={props.val}
			       checked={state===props.val}
			       onChange={onChange}
			/>
		</label>
	}

	return <div className={props.className}>
		{props.vals.map(v => <RadioButton name={props.vals.join("-")} val={v} />)}
	</div>
}

