pub fn auto_close_brackets(input: &str, selection_start: Option<usize>, car: char) -> String {
    let mut output = String::new();
    println!("input : {}", input);

    // Copy the content up to the selection start
    if let Some(start) = selection_start {
        output.push_str(&input[..start + 1]);
    } else {
        output.push_str(input);
    }

    // Add the closing parenthesis

    if car == '(' {
        output.push(')');
    } else if car == '{' {
        output.push('}');
    } else {
        output.push(']');
    }

    // Copy the content after the selection start
    if let Some(start) = selection_start {
        output.push_str(&input[start..]);
    }

    output
}