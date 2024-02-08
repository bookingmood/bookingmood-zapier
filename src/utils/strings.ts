// Regexps involved with splitting words in various case formats.
const SPLIT_LOWER_UPPER_RE = /([\p{Ll}\d])(\p{Lu})/gu;
const SPLIT_UPPER_UPPER_RE = /(\p{Lu})([\p{Lu}][\p{Ll}])/gu;

// Used to iterate over the initial split result and separate numbers.
const SPLIT_SEPARATE_NUMBER_RE = /(\d)\p{Ll}|(\p{L})\d/u;

// Regexp involved with stripping non-word characters from the result.
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;

// The replacement value for splits.
const SPLIT_REPLACE_VALUE = "$1\0$2";

// The default characters to keep after transforming case.
const DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";

/**
 * Supported locale values. Use `false` to ignore locale.
 * Defaults to `undefined`, which uses the host environment.
 */
type Locale = string[] | string | false | undefined;

/**
 * Options used for converting strings to pascal/camel case.
 */
interface PascalCaseOptions extends Options {
  mergeAmbiguousCharacters?: boolean;
}

/**
 * Options used for converting strings to any case.
 */
interface Options {
  locale?: Locale;
  split?: (value: string) => string[];
  /** @deprecated Pass `split: splitSeparateNumbers` instead. */
  separateNumbers?: boolean;
  delimiter?: string;
  prefixCharacters?: string;
  suffixCharacters?: string;
}

/**
 * Split any cased input strings into an array of words.
 */
function split(value: string) {
  let result = value.trim();

  result = result
    .replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE)
    .replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);

  result = result.replace(DEFAULT_STRIP_REGEXP, "\0");

  let start = 0;
  let end = result.length;

  // Trim the delimiter from around the output string.
  while (result.charAt(start) === "\0") start++;
  if (start === end) return [];
  while (result.charAt(end - 1) === "\0") end--;

  return result.slice(start, end).split(/\0/g);
}

/**
 * Split the input string into an array of words, separating numbers.
 */
function splitSeparateNumbers(value: string) {
  const words = split(value);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    const match = SPLIT_SEPARATE_NUMBER_RE.exec(word);
    if (match && match[1] && match[2]) {
      const offset = match.index + (match[1] ?? match[2]).length;
      words.splice(i, 1, word.slice(0, offset), word.slice(offset));
    }
  }
  return words;
}

/**
 * Convert a string to space separated lower case (`foo bar`).
 */
export function noCase(input: string, options?: Options) {
  const [prefix, words, suffix] = splitPrefixSuffix(input, options);
  return (
    prefix +
    words.map(lowerFactory(options?.locale)).join(options?.delimiter ?? " ") +
    suffix
  );
}

/**
 * Convert a string to capital case (`Foo Bar`).
 */
export function capitalCase(input: string, options?: Options) {
  const [prefix, words, suffix] = splitPrefixSuffix(input, options);
  const lower = lowerFactory(options?.locale);
  const upper = upperFactory(options?.locale);
  return (
    prefix +
    words
      .map(capitalCaseTransformFactory(lower, upper))
      .join(options?.delimiter ?? " ") +
    suffix
  );
}

/**
 * Convert a string to path case (`Foo bar`).
 */
export function sentenceCase(input: string, options?: Options) {
  const [prefix, words, suffix] = splitPrefixSuffix(input, options);
  const lower = lowerFactory(options?.locale);
  const upper = upperFactory(options?.locale);
  const transform = capitalCaseTransformFactory(lower, upper);
  return (
    prefix +
    words
      .map((word, index) => {
        if (index === 0) return transform(word);
        return lower(word);
      })
      .join(options?.delimiter ?? " ") +
    suffix
  );
}

/**
 * Convert a string to camel case (`fooBar`).
 */
export function camelCase(input: string, options: PascalCaseOptions = {}) {
  const [prefix, words, suffix] = splitPrefixSuffix(input, options);
  const lower = lowerFactory(options.locale);
  const upper = upperFactory(options.locale);
  const transform = capitalCaseTransformFactory(lower, upper);
  return (
    prefix +
    words
      .map((word, index) => {
        if (index === 0) return lower(word);
        return transform(word);
      })
      .join("") +
    suffix
  );
}

function lowerFactory(locale: Locale): (input: string) => string {
  return locale === false
    ? (input: string) => input.toLowerCase()
    : (input: string) => input.toLocaleLowerCase(locale);
}

function upperFactory(locale: Locale): (input: string) => string {
  return locale === false
    ? (input: string) => input.toUpperCase()
    : (input: string) => input.toLocaleUpperCase(locale);
}

function capitalCaseTransformFactory(
  lower: (input: string) => string,
  upper: (input: string) => string
) {
  return (word: string) => `${upper(word[0] ?? "")}${lower(word.slice(1))}`;
}

function splitPrefixSuffix(
  input: string,
  options: Options = {}
): [string, string[], string] {
  const splitFn =
    options.split ?? (options.separateNumbers ? splitSeparateNumbers : split);
  const prefixCharacters =
    options.prefixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  const suffixCharacters =
    options.suffixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  let prefixIndex = 0;
  let suffixIndex = input.length;

  while (prefixIndex < input.length) {
    const char = input.charAt(prefixIndex);
    if (!prefixCharacters.includes(char)) break;
    prefixIndex++;
  }

  while (suffixIndex > prefixIndex) {
    const index = suffixIndex - 1;
    const char = input.charAt(index);
    if (!suffixCharacters.includes(char)) break;
    suffixIndex = index;
  }

  return [
    input.slice(0, prefixIndex),
    splitFn(input.slice(prefixIndex, suffixIndex)),
    input.slice(suffixIndex),
  ];
}

export function singular(word: string) {
  if (word.endsWith("esses")) return word.slice(0, -2);
  return word.replace(/xes$/, "x").replace(/ies$/, "y").replace(/s$/, "");
}
