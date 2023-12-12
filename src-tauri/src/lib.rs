pub fn auto_close_brackets(input: &str) -> String {
    let mut output = String::new();
    let mut stack: Vec<char> = Vec::new();
    let mut opened_bracket = false;

    for c in input.chars() {
        match c {
            '(' | '[' | '{' => {
                stack.push(c);
                opened_bracket = true;
            }
            ')' => {
                if let Some('(') = stack.pop() {
                    // Do not append the closing bracket here
                }
            }
            ']' => {
                if let Some('[') = stack.pop() {
                    // Do not append the closing bracket here
                }
            }
            '}' => {
                if let Some('{') = stack.pop() {
                    // Do not append the closing bracket here
                }
            }
            _ => (),
        }
        output.push(c);
    }

    // Auto-close any remaining brackets
    for bracket in stack {
        match bracket {
            '(' => output.push_str("(|)"),
            '{' => output.push_str("{|}"),
            '[' => output.push_str("[|]"),
            _ => (),
        }
    }

    // Position the cursor between the brackets if an opening bracket was just added
    if opened_bracket {
        output.push('|');
    }

    println!("Input: {}", input);
    println!("Output: {}", output);

    output
}
