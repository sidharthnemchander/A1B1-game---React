import json


input_file = 'words_alpha.txt'
output_file = 'words.json'

five_letter_words = []

try:
    with open(input_file, 'r') as f:
        for line in f:
            word = line.strip().upper()
            
            if len(word) == 5:
                five_letter_words.append(word)


    with open(output_file, 'w') as f:
        json.dump(five_letter_words, f, indent=2)

    print(f"Success! Found {len(five_letter_words)} words. Saved to {output_file}")

except FileNotFoundError:
    print(f"Error: Could not find {input_file}. Please download it first.")