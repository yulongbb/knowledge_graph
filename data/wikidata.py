#!/usr/bin/env python3

"""Get Wikidata dump records as a JSON stream (one JSON object per line)"""
# Modified script taken from this link: "https://www.reddit.com/r/LanguageTechnology/comments/7wc2oi/does_anyone_know_a_good_python_library_code/dtzsh2j/"
import gzip
import json


def wikidata(filename):
    with gzip.open(filename, mode='rt') as f:
        f.read(2)
        for line in f:
            try:
                yield json.loads(line.rstrip(',\n'))
            except json.decoder.JSONDecodeError:
                continue


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
        description=__doc__
    )
    parser.add_argument(
        'dumpfile',
        help=(
            'a Wikidata dumpfile from: '
            'https://dumps.wikimedia.org/wikidatawiki/entities/'
            'latest-all.json.gz'
        )
    )
    args = parser.parse_args()


    for entity_dict in wikidata(args.dumpfile):
        print(entity_dict['labels']['zh'])