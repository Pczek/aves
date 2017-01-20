# Limitations

[Source](http://docs.aws.amazon.com/polly/latest/dg/limits.html)

## SynthesizeSpeech API Operation

+ The size of the input text can be up to *1500 billed characters* (3000 total characters). SSML tags are not counted as billed characters.
+ You can specify up to five lexicons to apply to the input text.
+ The output audio stream (synthesis) is *limited to 5 minutes*, after which, any remaining speech is cut off.
[API](http://docs.aws.amazon.com/polly/latest/dg/API_SynthesizeSpeech.html)

## Pronunciation Lexicons

+ You can store up to 100 lexicons per account.
+ Lexicon names can be an alphanumeric string up to 20 characters long.
+ Each lexicon can be up to 4,000 characters in size.
+ You can specify up to 100 characters for each `<phoneme>` or `<alias>` replacement in a lexicon.

[Help On Lexicons](http://docs.aws.amazon.com/polly/latest/dg/managing-lexicons.html)

## Speech Synthesis Markup Language (SSML)

+ The `<audio>`, `<lexicon>`, `<lookup>`, and `<voice>` tags are not supported.
+ `<break>` elements can specify a maximum duration of 10 seconds each.
+ The `<prosody>` tag doesn't support values for the rate attribute lower than -80%.

[SSML](https://www.w3.org/TR/2010/REC-speech-synthesis11-20100907/)



